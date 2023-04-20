import { ApiProperty } from '@nestjs/swagger';

export class ClinicInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  location: string;
}
