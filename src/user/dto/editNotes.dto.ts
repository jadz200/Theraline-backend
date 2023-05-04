import { ApiProperty } from '@nestjs/swagger';

export class EditNotesDto {
  @ApiProperty()
  body: string;
}
