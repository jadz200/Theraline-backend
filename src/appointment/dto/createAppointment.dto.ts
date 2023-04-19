import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../schema/appointment.schema';

export class paymentInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  status: PaymentStatus;

  @ApiProperty()
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  date: string | Date;
}

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patient_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  start_date: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  end_date: string;

  @ApiProperty({ required: true })
  @IsOptional()
  paymentInfo?: paymentInfoDto;
}