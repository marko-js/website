export function toDataURI(type: string, code: string) {
  return `data:${type};charset=utf-8;base64,${btoa(code)}`;
}
