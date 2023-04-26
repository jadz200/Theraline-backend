import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { PaymentStatus } from '../schema';

export class EditAmountDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  amount: number;

  @IsNotEmpty()
  @ApiProperty({
    enum: ['PENDING', 'AWAITING', 'PAID'],
    enumName: 'PaymentStatus',
  })
  @Type()
  status: PaymentStatus;
}
