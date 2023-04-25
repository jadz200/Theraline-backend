import { ApiProperty } from '@nestjs/swagger';

export class AppointmentStatsDto {
  @ApiProperty()
  week: { done: number; canceled: number };

  @ApiProperty()
  month: { done: number; canceled: number };

  @ApiProperty()
  year: { done: number; canceled: number };
}
