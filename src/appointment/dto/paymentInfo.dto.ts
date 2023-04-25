import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../schema';

export class PaymentInfoDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: PaymentStatus;

  @ApiProperty()
  method: PaymentMethod;

  @ApiProperty()
  @Type(() => Date)
  date: Date;
}
