import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
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
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Appointment)
  nextAppointment?: Appointment;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Appointment)
  lastAppointment?: Appointment;
}
