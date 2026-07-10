import { LoginInput } from '@mykks32/expense-crux-contracts';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto implements LoginInput {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
