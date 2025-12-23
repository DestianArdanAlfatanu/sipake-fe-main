import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the backend URL from environment variable
 */
export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
}

/**
 * Get the full URL for a backend asset (images, files, etc)
 * @param path - The path to the asset (e.g., "public/images/photo.jpg")
 * @returns Full URL to the asset
 */
export function getAssetUrl(path: string): string {
  const backendUrl = getBackendUrl();
  // Remove leading slash if exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath}`;
}
