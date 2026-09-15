export function requestReference(id?: string | null, prefix = "RD") {
  if (!id) return "";
  return `${prefix}-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function newRequestReference(prefix = "RD") {
  const token = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 8)
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(-8);
  return `${prefix}-${token.toUpperCase()}`;
}
