import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsPhoneNumber, IsString } from 'class-validator';

export class EditDoctoInfoDto {
  @ApiProperty()
  @IsAlpha()
  firstName: string;

  @ApiProperty()
  @IsAlpha()
  lastName: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;
}
