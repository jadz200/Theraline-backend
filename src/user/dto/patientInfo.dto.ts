import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientInfo {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  nextAppointment?: any;

  @ApiPropertyOptional()
  lastAppointment?: any;
}
