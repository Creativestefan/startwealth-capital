/**
 * Utility function to convert Prisma Decimal values to JavaScript numbers
 * This is needed because Next.js Server Components cannot pass Decimal objects to Client Components
 */
export function convertDecimalToNumber<T>(data: any): T {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => convertDecimalToNumber(item)) as unknown as T;
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result = { ...data };
    
    // Convert common decimal fields
    if ('price' in data && data.price && typeof data.price.toNumber === 'function') {
      result.price = parseFloat(data.price.toString());
    }
    
    if ('amount' in data && data.amount && typeof data.amount.toNumber === 'function') {
      result.amount = parseFloat(data.amount.toString());
    }
    
    if ('installmentAmount' in data && data.installmentAmount && typeof data.installmentAmount.toNumber === 'function') {
      result.installmentAmount = parseFloat(data.installmentAmount.toString());
    }
    
    if ('expectedReturn' in data && data.expectedReturn && typeof data.expectedReturn.toNumber === 'function') {
      result.expectedReturn = parseFloat(data.expectedReturn.toString());
    }
    
    if ('actualReturn' in data && data.actualReturn && typeof data.actualReturn.toNumber === 'function') {
      result.actualReturn = parseFloat(data.actualReturn.toString());
    }
    
    // Handle date fields - ensure they are properly serialized as ISO strings
    if ('createdAt' in data && data.createdAt instanceof Date) {
      result.createdAt = data.createdAt.toISOString();
    }
    
    if ('updatedAt' in data && data.updatedAt instanceof Date) {
      result.updatedAt = data.updatedAt.toISOString();
    }
    
    if ('startDate' in data && data.startDate instanceof Date) {
      result.startDate = data.startDate.toISOString();
    }
    
    if ('endDate' in data && data.endDate instanceof Date) {
      result.endDate = data.endDate.toISOString();
    }
    
    if ('nextPaymentDue' in data && data.nextPaymentDue instanceof Date) {
      result.nextPaymentDue = data.nextPaymentDue.toISOString();
    }
    
    // Handle nested objects
    for (const key in result) {
      if (typeof result[key] === 'object' && result[key] !== null && !(result[key] instanceof Date)) {
        result[key] = convertDecimalToNumber(result[key]);
      }
    }
    
    return result as T;
  }
  
  // Return primitives as is
  return data;
} 