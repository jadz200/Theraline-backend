import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Notes } from '../schema/notes.schema';
import { Gender } from '../../auth/schema';

export class PatientDetail {
  _id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  gender: Gender;

  @ApiProperty()
  birthday: Date;

  groups?: string[];

  doctors?: string[];

  notes?: Notes[];
}
