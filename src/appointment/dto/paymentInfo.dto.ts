import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsPositive } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../schema';

export class PaymentInfoDto {
  @ApiProperty()
  @IsPositive()
  amount: number;

  @ApiProperty({
    enum: ['PENDING', 'AWAITING', 'PAID'],
    enumName: 'PaymentStatus',
  })
  @IsEnum(['PENDING', 'AWAITING', 'PAID'])
  status: PaymentStatus;

  @ApiProperty({
    enum: ['CASH', 'CHECK', 'CREDIT CARD'],
    enumName: 'PaymentMethod',
  })
  @IsEnum(['CASH', 'CHECK', 'CREDIT CARD'])
  method: PaymentMethod;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;
}
