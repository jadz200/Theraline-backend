import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @IsMongoId()
  patient_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  end_date: Date;
}
