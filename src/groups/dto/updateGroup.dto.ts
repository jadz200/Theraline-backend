import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class UpdateChatDto {
  @ApiProperty()
  @IsMongoId()
  groupId: string;

  @ApiProperty()
  @IsMongoId()
  userId: string;
}
