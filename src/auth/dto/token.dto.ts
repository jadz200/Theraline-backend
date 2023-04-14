import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../schema/user.schema';

export class TokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refresh_token: string;

  @ApiProperty()
  role: UserRole;
}
