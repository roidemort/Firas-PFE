export const replacePlaceholders = (template: string, params: { [key: string]: string }): string =>{
  return template.replace(/\{([^}]+)\}/g, (_, key) => params[key] || `{${key}}`);
}