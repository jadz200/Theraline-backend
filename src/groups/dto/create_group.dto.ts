import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConvoDto {
  @ApiProperty()
  @IsNotEmpty()
  users_id: string[];
}
