/** Escapes regex special characters so user input can be safely used inside a `RegExp`/Mongo `$regex`. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
