import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { Appointment } from '../../appointment/schema';

export class PatientInfo {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  nextAppointment?: Appointment;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  lastAppointment?: Appointment;
}
