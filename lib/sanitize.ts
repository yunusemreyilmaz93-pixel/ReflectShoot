/** Remove undefined values so Firestore set/update does not reject the payload. */
export function sanitizeData<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => sanitizeData(v)) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as object).reduce((acc, key) => {
      const value = sanitizeData((obj as Record<string, unknown>)[key]);
      if (value !== undefined) {
        (acc as Record<string, unknown>)[key] = value;
      }
      return acc;
    }, {} as T);
  }
  return obj;
}
