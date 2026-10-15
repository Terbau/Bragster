FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.8 /uv /bin/uv

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY padel_analyzer ./padel_analyzer

ENV PATH="/app/.venv/bin:$PATH"
CMD ["python", "-m", "padel_analyzer", "worker"]
