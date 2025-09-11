"use client"

import { type ChangeEvent, forwardRef, useState } from "react";
import { Input, type InputProps } from "./index";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

export type FileInputProps = Omit<InputProps, "onChange"> & {
  hasPreview?: boolean;
  onChange?: (file?: File) => void;
};

export const FileInput = forwardRef<
  HTMLInputElement,
  Omit<FileInputProps, "type">
>(({ hasPreview = true, onChange, ...props }, ref) => {
  const [currentFileSrc, setCurrentFileSrc] = useState<string | undefined>(
    undefined,
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onChange?.(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentFileSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <Input type="file" ref={ref} onChange={handleFileChange} {...props} />
      {hasPreview && currentFileSrc && (
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="absolute top-0 right-0 text-xs hover:bg-accent hover:text-accent-foreground rounded-sm px-1.5"
            >
              Preview
            </button>
          </DialogTrigger>
          <DialogContent className="flex flex-col min-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            <div className="h-full w-full flex items-center justify-center grow overflow-hidden relative">
              <Image
                src={currentFileSrc}
                alt="Image preview"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
});
FileInput.displayName = "FileInput";
