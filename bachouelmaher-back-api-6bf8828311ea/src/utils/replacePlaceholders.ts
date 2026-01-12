// utils/replacePlaceholders.ts - FIXED VERSION
export const replacePlaceholders = (template: string, params: { [key: string]: string }): string => {
  if (!template) return '';
  
  let result = template;
  
  // Fix for both {{placeholder}} and {placeholder} formats
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return params[key.trim()] || match;
  });
  
  // Also handle single braces just in case
  result = result.replace(/\{([^}]+)\}/g, (match, key) => {
    return params[key.trim()] || match;
  });
  
  return result;
}