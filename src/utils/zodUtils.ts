import { z } from "zod";

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/gif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const IMAGE_SCHEMA = z
  .instanceof(File)
  .optional()
  .refine((file) => !file || ALLOWED_IMAGE_TYPES.includes(file.type), {
    message: "Only jpeg, png and webp images are allowed",
  })
  .refine((file) => !file || file.size < MAX_FILE_SIZE, {
    message: "File size must be less than 10MB",
  });
