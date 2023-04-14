import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClinicInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
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

  @IsOptional()
  @ApiProperty()
  image?: string;

  @IsNotEmpty()
  @ApiProperty({ type: ClinicInfoDto })
  clinicInfo: ClinicInfoDto;
}
