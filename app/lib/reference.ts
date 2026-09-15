export function requestReference(id?: string | null, prefix = "RD") {
  if (!id) return "";
  return `${prefix}-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
