/**
 * Parses a "field:order,field:order" string (e.g. "date:desc,amount:asc") into
 * a Mongo sort object. Falls back to `{ [defaultField]: -1 }` if `sortBy` is
 * empty — callers should validate the format/allowed fields upfront (e.g. via
 * a `@Matches()` DTO validator) since this does no validation itself.
 *
 * @param sortBy - The raw "field:order" string, already validated.
 * @param defaultField - Field to sort by when `sortBy` is not given.
 * @returns A Mongo-compatible sort object.
 */
export function parseSortBy(sortBy: string | undefined, defaultField: string): Record<string, 1 | -1> {
  if (!sortBy) {
    return { [defaultField]: -1 };
  }

  return sortBy.split(',').reduce<Record<string, 1 | -1>>((sort, pair) => {
    const [field, order] = pair.split(':');
    if (field && order) {
      sort[field] = order.toLowerCase() === 'asc' ? 1 : -1;
    }
    return sort;
  }, {});
}
