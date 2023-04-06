import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
  ApiConsumes,
  ApiProduces,
  ApiTags,
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
  @ApiBody({
    description: 'Data required to create a new doctor',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
        image: { type: 'string', format: 'binary' },
        clinicInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            location: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @UseInterceptors(FileInterceptor('image', { dest: './uploads' }))
  async create_doctor(
    @Body() dto: CreateDoctorDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (typeof dto.clinicInfo === 'string') {
      dto.clinicInfo = JSON.parse(dto.clinicInfo);
    }
    if (dto.image == '') {
      dto.image = undefined;
    }
    if (dto.image) {
      dto.image = (await this.cloudinaryService.upload(image)).url;
    }
    return this.userService.createDoctor(dto);
  }

  @Get('/clinicInfo')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async get_clinicInfo(@GetCurrentUserId() id: mongoose.Types.ObjectId) {
    return await this.userService.getClinicInfo(id.toString());
  }

  @Get('/patient-list')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async getPatientList(@GetCurrentUserId() id: mongoose.Types.ObjectId) {
    return await this.userService.getPatientList(id.toString());
  }

  @Delete('/delete/:id/user')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async deleteUser(@Param(':id') id) {
    return await this.userService.deleteUser(id);
  }
}
