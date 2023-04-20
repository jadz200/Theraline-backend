import { ApiProperty } from '@nestjs/swagger';
import { ClinicInfo } from 'src/auth/schema';

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
  clinicInfo: ClinicInfo;
}
