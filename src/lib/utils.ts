import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Example utility function (can be expanded)
export const formatCurrency = (amount: number | undefined, currency: string = "USD"): string => {
  if (amount === undefined) return "N/A";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: amount < 0.01 && amount !== 0 ? 6 : 2, // Show more digits for very small amounts
  }).format(amount);
};

export const truncateText = (text: string | undefined | null, maxLength: number = 20): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const formatPrincipal = (principal: string | undefined | null, startChars = 6, endChars = 4): string => {
    if (!principal) return '';
    if (principal.length <= startChars + endChars + 3) return principal; // If it's too short to truncate meaningfully
    return `${principal.substring(0, startChars)}...${principal.substring(principal.length - endChars)}`;
};

export const timeAgo = (timestamp: number | bigint | Date | undefined | null): string => {
  if (!timestamp) return 'N/A';

  const now = new Date();
  const then = new Date(typeof timestamp === 'bigint' ? Number(timestamp / BigInt(1_000_000)) : Number(timestamp)); // Assuming nanoseconds for bigint, convert to ms

  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'just now'; // Handle invalid or future dates

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      return rtf.format(-interval, unit);
    }
  }
  return 'just now';
};

// Debounce function
export function debounce<T extends (...args: any[]) => any>(func: T, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> =>
    new Promise<ReturnType<T>>(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

// Ethereum address validation (basic)
export const isValidEVMAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// ICP Principal validation (basic)
export const isValidPrincipalID = (principalId: string): boolean => {
    // Basic regex: checks for format like xxxxx-xxxxx-xxxxx-xxxxx-xxx or rdmx6-jaaaa-aaaaa-aaadq-cai
    // This is a simplified check. Real validation is more complex.
    return /^[a-z0-9]{5}(-[a-z0-9]{5}){3,}-[a-z0-9]{3}$/i.test(principalId) ||
           /^[a-z0-9]{5}(-[a-z0-9]{5})*-[a-z0-9]{3}$/i.test(principalId);
};

// Get unique items from array by key
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const k = item[key];
    return seen.has(k) ? false : seen.add(k);
  });
}
