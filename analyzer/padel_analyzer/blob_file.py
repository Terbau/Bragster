"""A blob in Azure Storage that can be read like a file, a piece at a time"""

from __future__ import annotations

import io
from typing import Protocol


class _Downloader(Protocol):
    def read_range(self, offset: int, length: int) -> bytes: ...


class AzureBlobRange:
    """Reads parts of a blob with the Azure SDK, which retries on its own"""

    def __init__(self, blob_client):
        self.blob = blob_client

    def read_range(self, offset: int, length: int) -> bytes:
        return self.blob.download_blob(offset=offset, length=length).readall()


class BlobFile(io.RawIOBase):
    """
    Reads a blob in chunks as they are needed, so a long video never has to be
    downloaded first or fit on disk
    """

    CHUNK_SIZE = 8 * 1024 * 1024

    def __init__(self, downloader: _Downloader, size: int):
        self.downloader = downloader
        self.size = size
        self.position = 0
        self.chunk_start = 0
        self.chunk = b""

    def readable(self) -> bool:
        return True

    def seekable(self) -> bool:
        return True

    def tell(self) -> int:
        return self.position

    def seek(self, offset: int, whence: int = io.SEEK_SET) -> int:
        if whence == io.SEEK_SET:
            self.position = offset
        elif whence == io.SEEK_CUR:
            self.position += offset
        elif whence == io.SEEK_END:
            self.position = self.size + offset
        else:
            raise ValueError(f"Unknown whence {whence}")
        self.position = max(0, self.position)
        return self.position

    def readinto(self, buffer) -> int:
        if self.position >= self.size:
            return 0
        if not (self.chunk_start <= self.position < self.chunk_start + len(self.chunk)):
            length = min(self.CHUNK_SIZE, self.size - self.position)
            self.chunk = self.downloader.read_range(self.position, length)
            self.chunk_start = self.position
        start = self.position - self.chunk_start
        count = min(len(buffer), len(self.chunk) - start)
        buffer[:count] = self.chunk[start : start + count]
        self.position += count
        return count
