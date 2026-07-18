import { RegisterInput } from '@mykks32/expense-crux-contracts';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto implements RegisterInput {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}
