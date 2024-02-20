export const isEmpty = (value: any): value is boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number') return false;
  if (Array.isArray(value)) return !value.length;
  if (Object.prototype.toString.call(value) === '[object Date]') return false;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  if (Object.prototype.toString.call(value) === '[object String]')
    return value === '';
  return false;
};
