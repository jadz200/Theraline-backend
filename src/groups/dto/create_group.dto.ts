import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty()
  @IsNotEmpty()
  users_id: string[];
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({ type: 'string', format: 'binary' })
  image: string;
}
