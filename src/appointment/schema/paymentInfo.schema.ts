import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PaymentMethod, PaymentStatus } from './status.schema';

export class PaymentInfo {
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
  date: Date;
}
