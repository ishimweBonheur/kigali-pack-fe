/** Normalizes API list payloads that may be a bare array or `{ items: T[] }`. */
export function normalizeListItems<T>(
  data: T[] | { items?: T[] | null } | null | undefined,
): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && Array.isArray(data.items)) return data.items;
  return [];
}
