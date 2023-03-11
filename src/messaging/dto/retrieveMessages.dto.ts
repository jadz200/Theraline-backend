import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RetrieveMessagesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  group_id: string;
}
