import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
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
import { User } from '../auth/schema/user.schema';
import {
  SwaggerForbiddenResponse,
  SwaggerResponseSuccessfulWithMessage,
  SwaggerUnauthorizedResponse,
} from '../common/swagger/general.swagger';
import { Roles, GetCurrentUserId } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserService } from './user.service';
import {
  CreateDoctorDto,
  EditDoctoInfoDto,
  PatientInfo,
  PatientDetail,
  CreateNotesDto,
} from './dto';
import { ClinicInfoDto } from './dto/clinicInfo.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @ApiOperation({ summary: 'Creates a doctor' })
  @ApiCreatedResponse(
    SwaggerResponseSuccessfulWithMessage('Created Doctor Account'),
  )
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Post('/create_doctor')
  async create_doctor(@Body() dto: CreateDoctorDto) {
    const dtoCopy = { ...dto };
    if (dto.image) {
      dtoCopy.image = (await this.cloudinaryService.uploadImage(dto.image)).url;
    }
    return this.userService.createDoctor(dtoCopy);
  }

  @ApiOkResponse({ type: ClinicInfoDto })
  @Get('/get_clinic_info')
  @ApiOperation({ summary: 'Gets a doctor clinic info' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async get_clinicInfo(@GetCurrentUserId() id: mongoose.Types.ObjectId) {
    return this.userService.getClinicInfo(id.toString());
  }

  @ApiOkResponse({ type: PatientInfo })
  @ApiOperation({
    summary:
      'Gets the list of patients that have had an appointments with the doctor',
  })
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @Roles('DOCTOR')
  @Get('/patient_list')
  async getPatientList(
    @GetCurrentUserId() id: mongoose.Types.ObjectId,
  ): Promise<PatientInfo[]> {
    return this.userService.getPatientList(id.toString());
  }

  @ApiOkResponse(SwaggerResponseSuccessfulWithMessage('Doctor changed info'))
  @ApiOperation({ summary: 'Edit Doctor info' })
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Put('edit_doctor_info')
  async editDoctorInfo(
    @GetCurrentUserId() doctorId,
    @Body() dto: EditDoctoInfoDto,
  ) {
    return this.userService.edit_doctor(dto, doctorId);
  }

  @ApiOkResponse(SwaggerResponseSuccessfulWithMessage('User deleted'))
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @Roles('DOCTOR')
  @Delete(':user_id/delete/')
  async deleteUser(@Param('user_id') id) {
    return this.userService.deleteUser(id);
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
  @ApiOperation({ summary: 'Gets a list of all the patients in the database' })
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Get('/patients')
  async get_patients(): Promise<User[]> {
    return this.userService.get_all_patients();
  }

  @ApiOkResponse({ type: PatientDetail })
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Get('/patient_details_email/:email')
  @ApiOperation({ summary: 'Gets patient details using that patient email' })
  async get_patient_details_email(
    @Param('email') email: string,
  ): Promise<PatientDetail> {
    return this.userService.get_patient_details_email(email);
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
  @ApiOperation({ summary: 'Gets patient details using that patient _id' })
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Get('/patient_details/:id')
  async get_patient_details_id(
    @Param('id') patientId: string,
    @GetCurrentUserId() doctorId,
  ): Promise<PatientDetail> {
    return this.userService.get_patient_details_id(patientId, doctorId);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiOperation({ summary: 'Adds a note doctor to a patient' })
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Post('add_note')
  async add_note(@GetCurrentUserId() doctorId, @Body() dto: CreateNotesDto) {
    return this.userService.add_note(doctorId, dto);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiOperation({
    summary: 'Get all the notes for a patient written by a doctor',
  })
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Get('get_notes/:patient_id')
  async get_notes(
    @GetCurrentUserId() doctorId,
    @Param('patient_id') patientId: string,
  ) {
    return this.userService.get_notes(doctorId, patientId);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiOperation({ summary: 'Updates a note' })
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Put('update_note/:note_id')
  async update_notes(
    @GetCurrentUserId() doctorId,
    @Param('note_id') noteId: string,
  ) {
    return this.userService.update_note(doctorId, noteId);
  }
}
