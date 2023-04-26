import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../schema';
import { IsEnum } from 'class-validator';

export class PaymentInfoDto {
  @ApiProperty()
  amount: number;

  @ApiProperty({
    enum: ['PENDING', 'AWAITING', 'PAID'],
    enumName: 'PaymentStatus',
  })
  status: PaymentStatus;

  @ApiProperty({
    enum: ['CASH', 'CHECK', 'CREDIT CARD'],
    enumName: 'PaymentMethod',
  })
  @IsEnum(['CASH', 'CHECK', 'CREDIT CARD'])
  method: PaymentMethod;

  @ApiProperty()
  @Type(() => Date)
  date: Date;
}
