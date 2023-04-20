import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject } from 'class-validator';
import { PaymentMethod, PaymentStatus } from './status.schema';

export class PaymentInfo {
  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type()
  status: PaymentStatus;

  @ApiProperty()
  @IsNotEmpty()
  @Type()
  method: PaymentMethod;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  date: Date;
}
