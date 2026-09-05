export function removeEmptyProperties<T extends any>(obj: Record<keyof any, any>) {
  const newObj = { ...obj }; // Create a new object to avoid directly modifying the original object

  Object.keys(newObj).forEach((key) => {
    if (['', undefined, null].includes(newObj[key])) {
      delete newObj[key];
    }
  });

  return newObj as T;
}

export function isEmptyObject(obj: Record<keyof any, any>) {
  return Object.keys(obj).length === 0;
}
