import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared page container: every section, the navbar, and the footer align to this.
export const CONTAINER = "mx-auto w-full max-w-[1120px] px-5 sm:px-8"
