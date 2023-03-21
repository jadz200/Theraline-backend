import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../schema/appointement.schema';

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
  date: string;
}

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patient_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  date: string;

  @ApiProperty({ required: true })
  paymentInfo: paymentInfoDto;
}
