import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../schema/user.schema';

export class AuthResponse {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refresh_token: string;

  @ApiProperty()
  @IsNotEmpty()
  role: UserRole;
}
