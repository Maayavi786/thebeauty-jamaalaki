import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format time for display
export function formatTime(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format price with currency
export function formatPrice(price: number, currency: string = 'SAR'): string {
  return `${price} ${currency}`;
}

// Get available time slots for booking
export function getTimeSlots(startHour: number = 9, endHour: number = 19, intervalMinutes: number = 30) {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += intervalMinutes) {
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}

// Format booking status for display with appropriate class
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Get a list of SAR price ranges for filtering
export function getPriceRanges() {
  return [
    { label: 'Under 100 SAR', value: 'under-100' },
    { label: '100-200 SAR', value: '100-200' },
    { label: '200-300 SAR', value: '200-300' },
    { label: '300-500 SAR', value: '300-500' },
    { label: 'Over 500 SAR', value: 'over-500' },
  ];
}

// Generate an Islamic pattern SVG
export function getIslamicPatternSvg(color: string = '#D4AF37'): string {
  return `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 10L85 30L85 70L60 90L35 70L35 30L60 10Z" stroke="${color}" fill="none" stroke-width="0.5" opacity="0.5"/>
    <path d="M60 30L75 40L75 60L60 70L45 60L45 40L60 30Z" stroke="${color}" fill="none" stroke-width="0.5" opacity="0.5"/>
    <path d="M60 0L90 20L90 80L60 100L30 80L30 20L60 0Z" stroke="${color}" fill="none" stroke-width="0.5" opacity="0.3"/>
    <path d="M60 0L60 100" stroke="${color}" fill="none" stroke-width="0.5" opacity="0.2"/>
    <path d="M30 20L90 80" stroke="${color}" fill="none" stroke-width="0.5" opacity="0.2"/>
    <path d="M90 20L30 80" stroke="${color}" fill="none" stroke-width="0.5" opacity="0.2"/>
    <path d="M0 50L100 50" stroke="${color}" fill="none" stroke-width="0.5" opacity="0.2"/>
  </svg>`;
}
