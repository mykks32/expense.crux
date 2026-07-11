import { ClassConstructor, plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';

/** Instantiates a serializer class from an entity/plain object, exposing only `@Expose()`d fields. Mongoose documents (including virtuals like `id`) resolve correctly when passed directly. */
export function serialize<T>(cls: ClassConstructor<T>, source: object): T {
  return plainToInstance(cls, source, {
    strategy: 'excludeAll',
    exposeUnsetFields: false,
    excludeExtraneousValues: true,
  });
}

/** Resolves an id to a string from either a Mongoose Document (`id` virtual) or a plain object from `.aggregate()`/`.lean()` (raw `_id` ObjectId only). For use in `@Transform(({ obj }) => resolveId(obj))`. */
export function resolveId(source: { _id?: unknown; id?: unknown }): string | undefined {
  const value = source._id ?? source.id;
  if (typeof value === 'string') return value;
  if (value instanceof Types.ObjectId) return value.toString();
  return undefined;
}
