import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsString()
  @IsNotEmpty()
  MONGO_URI: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsOptional()
  @IsString()
  ACCESS_TOKEN_TTL?: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsOptional()
  @IsString()
  REFRESH_TOKEN_TTL?: string;
}
