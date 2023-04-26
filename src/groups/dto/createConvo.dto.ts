import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';

export class CreateConvoDto {
  @ApiProperty({ type: String, isArray: true })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  users_id: string[];
}
