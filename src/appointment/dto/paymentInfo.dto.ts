import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../schema';

export class PaymentInfoDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: PaymentStatus;

  @ApiProperty()
  method: PaymentMethod;

  @ApiProperty()
  date: string;
}
