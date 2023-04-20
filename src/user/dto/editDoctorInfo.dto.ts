import { ApiProperty } from '@nestjs/swagger';
import { ClinicInfoDto } from './createDoctor.dto';

export class EditDoctoInfoDto {
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  image: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  clinicInfo: ClinicInfoDto;
}