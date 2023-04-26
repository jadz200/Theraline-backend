import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsPhoneNumber, IsString } from 'class-validator';

export class ClinicInfoDto {
  @ApiProperty()
  @IsAlpha()
  name: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsString()
  location: string;
}
