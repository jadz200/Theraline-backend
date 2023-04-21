import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject } from 'class-validator';
import { PaymentMethod, PaymentStatus } from './status.schema';

export class PaymentInfo {
  @ApiProperty()
  @IsNotEmpty()
  @Prop()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type()
  @Prop()
  status: PaymentStatus;

  @ApiProperty()
  @IsNotEmpty()
  @Type()
  @Prop()
  method: PaymentMethod;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  @Prop()
  date: Date;
}
