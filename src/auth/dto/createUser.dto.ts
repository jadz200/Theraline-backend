import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Gender } from '../schema';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type()
  gender: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  expoToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  birthday?: string;
}
