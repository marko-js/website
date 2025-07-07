const urls = new Map<string, string>();

export function toAssetURL(id: string, type: string, code: string) {
  let url = urls.get(id);
  if (url) URL.revokeObjectURL(url);
  url = URL.createObjectURL(new Blob([code], { type }));
  urls.set(id, url);
  return url;
}
