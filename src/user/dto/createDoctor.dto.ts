import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClinicInfo } from 'src/auth/schema';

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

  @IsNotEmpty()
  @ApiProperty()
  image: string;

  @IsNotEmpty()
  @IsOptional()
  phone: string;

  @IsNotEmpty()
  @ApiProperty({ type: ClinicInfo })
  clinicInfo: ClinicInfo;
}
