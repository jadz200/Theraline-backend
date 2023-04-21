import { ApiProperty } from '@nestjs/swagger';

export class PaymentStatsDto {
  @ApiProperty()
  week: number;

  @ApiProperty()
  month: number;

  @ApiProperty()
  all: number;
}
