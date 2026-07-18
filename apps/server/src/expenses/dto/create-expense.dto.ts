import { CreateExpenseInput } from '@mykks32/expense-crux-contracts';
import { IsISO8601, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateExpenseDto implements CreateExpenseInput {
  @IsString()
  @MinLength(1)
  title: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
