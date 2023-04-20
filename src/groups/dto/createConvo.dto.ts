import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateConvoDto {
  @ApiProperty({ type: String, isArray: true })
  @IsNotEmpty()
  users_id: string[];
}
