import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanDataForFirestore(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => cleanDataForFirestore(item));
  }

  if (typeof data === 'object' && !(data instanceof Date) && typeof data.toDate !== 'function') {
     // Don't process File objects or other complex objects that should not be in Firestore
    if (typeof File !== 'undefined' && data instanceof File) {
      return null; // Or handle as needed, e.g., by returning a placeholder
    }
    const cleanedObject: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value !== undefined) {
          const cleanedValue = cleanDataForFirestore(value);
          if (cleanedValue !== undefined && cleanedValue !== null) { // Firestore doesn't store null fields by default
             cleanedObject[key] = cleanedValue;
          }
        }
      }
    }
    return cleanedObject;
  }

  return data;
}
