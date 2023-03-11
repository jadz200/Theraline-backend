import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  group_id: string;
}
