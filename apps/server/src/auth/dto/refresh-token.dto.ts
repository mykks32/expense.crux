import { RefreshTokenInput } from '@mykks32/expense-crux-contracts';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto implements RefreshTokenInput {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
