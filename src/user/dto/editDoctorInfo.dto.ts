import { ApiProperty } from '@nestjs/swagger';

export class EditDoctoInfoDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  phone: string;
}
