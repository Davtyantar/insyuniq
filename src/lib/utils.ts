import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Stable pseudo-random helper so mock data renders identically on server and client. */
export function seededPick<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

export function range(from: number, to: number, step = 1) {
  const out: number[] = [];
  for (let i = from; step > 0 ? i <= to : i >= to; i += step) out.push(i);
  return out;
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}
