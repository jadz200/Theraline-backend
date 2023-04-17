import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
import { CreateDoctorDto } from '../auth/dto';
import { Roles, GetCurrentUserId } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserService } from './user.service';

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
  @ApiCreatedResponse({
    description: 'Successful Response',
    schema: {
      example: {
        msg: 'Created Doctor Account',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden Acees',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
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

  @Delete('/delete/:user_id/user')
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
  @ApiOkResponse({})
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden Acees',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @Get('/patients')
  @ApiOperation({ summary: 'Gets a list of all the patients' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async get_patients() {
    return await this.userService.get_all_patients();
  }
}
