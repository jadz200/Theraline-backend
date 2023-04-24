import {
  Allow,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ClinicInfoDto } from './clinicInfo.dto';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

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
    enum: Gender,
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

  @IsNotEmpty()
  @IsOptional()
  phone: string;

  @ApiProperty({
    type: ClinicInfoDto,
  })
  @Type(() => ClinicInfoDto)
  @IsNotEmpty()
  clinicInfo: ClinicInfoDto;
}
