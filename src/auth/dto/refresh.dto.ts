import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
