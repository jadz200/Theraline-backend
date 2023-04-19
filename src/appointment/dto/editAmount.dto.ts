import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class EditAmountDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  amount: number;
}
