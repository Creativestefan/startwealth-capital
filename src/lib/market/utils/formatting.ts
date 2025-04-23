/**
 * Market-specific formatting utilities
 */

/**
 * Formats a currency value for display
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatMarketCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a percentage value for display
 * @param value The percentage value to format
 * @returns Formatted percentage string
 */
export function formatMarketPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Formats a date for display in market context
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatMarketDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date instanceof Date ? date : new Date(date));
}

/**
 * Serializes data from Prisma to ensure it can be safely passed to the client
 * Handles Decimal, Date, BigInt, and other non-serializable types
 */
export function serializeMarketData<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(item => serializeMarketData(item)) as unknown as T;
  }
  
  if (data && typeof data === 'object') {
    const serialized: Record<string, any> = { ...data };
    for (const [key, value] of Object.entries(serialized)) {
      if (value && typeof value === 'object' && 'toString' in value) {
        // Handle Decimal values from Prisma
        serialized[key] = parseFloat(value.toString());
      } else if (value && typeof value === 'object') {
        serialized[key] = serializeMarketData(value);
      }
    }
    return serialized as T;
  }
  
  return data;
} 