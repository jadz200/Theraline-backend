import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentInfoDto } from './paymentInfo.dto';
import { AppointmentStatus } from '../schema';

export class GetAppointmentDto {
  @ApiProperty()
  @IsMongoId()
  @Type()
  _id: string;

  @ApiProperty({
    type: 'object',
    properties: {
      _id: { type: 'string' },
      fullName: { type: 'string' },
      email: { type: 'string' },
    },
  })
  @IsNotEmpty()
  @IsObject()
  patient: {
    _id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({
    type: 'object',
    properties: {
      _id: { type: 'string' },
      fullName: { type: 'string' },
      email: { type: 'string' },
    },
  })
  @IsNotEmpty()
  @IsObject()
  doctor: {
    _id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  end_date: Date;

  @ApiProperty({
    enum: ['CREATED', 'CONFIRMED', 'CANCELED', 'DONE'],
    enumName: 'AppointmentStatus',
  })
  @IsEnum(['CREATED', 'CONFIRMED', 'CANCELED', 'DONE'])
  status: AppointmentStatus;

  @ApiPropertyOptional()
  paymentInfo?: PaymentInfoDto;
}
