import {
  Allow,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ClinicInfoDto } from './clinicInfo.dto';
import { Gender } from '../../auth/schema';

export class CreateDoctorDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    enum: ['MALE', 'FEMALE', 'OTHER'],
    enumName: 'Gender',
  })
  @Allow()
  gender: Gender;

  @ApiProperty()
  @Allow()
  @Type(() => Date)
  birthday: Date;

  @IsNotEmpty()
  @ApiProperty()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    type: ClinicInfoDto,
  })
  @Type(() => ClinicInfoDto)
  @IsNotEmpty()
  clinicInfo: ClinicInfoDto;
}
