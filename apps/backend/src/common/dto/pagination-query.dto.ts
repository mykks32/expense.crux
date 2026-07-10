import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * Query params accepted by paginated list endpoints (`?page=&limit=`).
 */
export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  page = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  limit = 10;

  /**
   * Number of documents to skip to reach {@link page}, given {@link limit}.
   *
   * @returns The computed offset.
   */
  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
