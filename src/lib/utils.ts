import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, locale: string = "tr-TR"): string {
  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatTime(date: Date | string, locale: string = "tr-TR"): string {
  // If it's a time-only string like "19:00" or "19:00:00"
  if (typeof date === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(date)) {
    const [hours, minutes] = date.split(":")
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
  }
  // Otherwise treat as full date
  return new Date(date).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateTime(date: Date | string, locale: string = "tr-TR"): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`
}

export function getCountdown(targetDate: Date | string) {
  const now = new Date().getTime()
  const target = new Date(targetDate).getTime()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" }[c] || c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}