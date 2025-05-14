
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function formatTime(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatLastSeen(date: Date | string | undefined): string {
  if (!date) return "Не в сети";
  
  const lastSeen = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSec < 60) {
    return "Только что";
  } else if (diffMin < 60) {
    return `Был(а) ${diffMin} ${getDeclension(diffMin, ['минуту', 'минуты', 'минут'])} назад`;
  } else if (diffHours < 24) {
    return `Был(а) ${diffHours} ${getDeclension(diffHours, ['час', 'часа', 'часов'])} назад`;
  } else if (diffDays === 1) {
    return "Был(а) вчера";
  } else {
    return `Был(а) ${diffDays} ${getDeclension(diffDays, ['день', 'дня', 'дней'])} назад`;
  }
}

function getDeclension(number: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20 
      ? 2 
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
}

export function generateAvatarFallback(name: string): string {
  if (!name) return "?";
  return name.split(" ").map(word => word[0]).join("").toUpperCase();
}
