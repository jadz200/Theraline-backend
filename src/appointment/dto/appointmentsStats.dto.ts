import { ApiProperty } from '@nestjs/swagger';

export class AppointmentStatsDto {
  @ApiProperty()
  week: { label: string[]; done: number; canceled: number };

  @ApiProperty()
  month: { label: string[]; done: number; canceled: number };

  @ApiProperty()
  year: { label: string[]; done: number; canceled: number };
}
