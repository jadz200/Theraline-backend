import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../schema/appointement.schema';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patient_id: string;
  @ApiProperty()
  @IsNotEmpty()
  time: string;
  @ApiProperty()
  paymentInfo: {
    amount: number;
    status: PaymentStatus;
    method: PaymentMethod;
    date: string;
  };
}
