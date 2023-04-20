import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import mongoose from 'mongoose';
import { User } from '../auth/dto';
import { Roles, GetCurrentUserId } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserService } from './user.service';
import { CreateDoctorDto, EditDoctoInfoDto, UserDetail } from './dto';
import {
  SwaggerForbiddenResponse,
  SwaggerResponseSuccessfulWithMessage,
  SwaggerUnauthorizedResponse,
} from 'src/common/swagger/general.swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Roles('ADMIN')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Creates a doctor' })
  @Post('/create_doctor')
  @ApiCreatedResponse(
    SwaggerResponseSuccessfulWithMessage('Created Doctor Account'),
  )
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  async create_doctor(@Body() dto: CreateDoctorDto) {
    if (dto.image) {
      dto.image = (await this.cloudinaryService.upload(dto.image)).url;
    }
    return this.userService.createDoctor(dto);
  }

  @Get('/get_clinic_info')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async get_clinicInfo(@GetCurrentUserId() id: mongoose.Types.ObjectId) {
    return await this.userService.getClinicInfo(id.toString());
  }

  @Get('/patient_list')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async getPatientList(@GetCurrentUserId() id: mongoose.Types.ObjectId) {
    return await this.userService.getPatientList(id.toString());
  }

  @Put('edit_doctor_info')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async editDoctorInfo(
    @GetCurrentUserId() doctor_id,
    @Body() dto: EditDoctoInfoDto,
  ) {
    return this.userService.edit_doctor(dto, doctor_id);
  }

  @Delete(':user_id/delete/')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async deleteUser(@Param(':user_id') id) {
    return await this.userService.deleteUser(id);
  }

  @ApiOkResponse({
    schema: {
      example: {
        test: [
          {
            _id: 'string',
            email: 'string@gmail.com',
            firstName: 'string',
            lastName: 'string',
            image: 'string',
          },
          {
            _id: 'string',
            email: 'string@gmail.com',
            firstName: 'string',
            lastName: 'string',
            image: 'string',
          },
          {
            _id: 'string',
            email: 'string@gfr.com',
            firstName: 'string',
            lastName: 'string',
            image: null,
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @Get('/patients')
  @ApiOperation({ summary: 'Gets a list of all the patients' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async get_patients(): Promise<User[]> {
    return await this.userService.get_all_patients();
  }

  @ApiOkResponse({
    schema: {
      example: {
        _id: 'string',
        firstName: 'string',
        lastName: 'string',
        email: 'string@gmail.com',
        doctors_id: ['string'],
      },
    },
  })
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @Get('/patient_details/:email')
  @ApiOperation({ summary: 'Gets patient details using that patient email' })
  async get_patient_details(
    @Param('email') email: string,
  ): Promise<UserDetail> {
    return await this.userService.get_patient_details(email);
  }
}
