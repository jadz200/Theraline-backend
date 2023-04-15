import { Body, Controller, Post } from '@nestjs/common';
import { Get, Param, Patch, Query, UseGuards } from '@nestjs/common/decorators';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import mongoose from 'mongoose';
import { PaginationParams } from '../common/dto/paginationParams.dto';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto, paymentInfoDto } from './dto/index';

@ApiTags('Appointment')
@Controller('appointment')
export class AppointementController {
  constructor(private appointmentService: AppointmentService) {}

  @ApiCreatedResponse({
    schema: {
      example: {
        msg: 'Created Appointment',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @Post('/create_appointment')
  @ApiOperation({ summary: 'Doctor creates appointment' })
  @ApiBody({
    type: CreateAppointmentDto,
    examples: {
      example1: {
        value: {
          title: 'Cool appointment',
          patient_id: '1234',
          start_date: '2023-11-07T12:30:00',
          end_date: '2023-11-07T13:30:00',
        },
        summary: 'An example appointment request ',
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
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: {
            value: {
              statusCode: 400,
              message: 'Id is not in valid format',
              error: 'Bad Request',
            },
          },
          Date_format: {
            value: {
              statusCode: 400,
              message: [
                'start_date and end_date must match /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$/ regular expression',
              ],
              error: 'Bad Request',
            },
          },
          Unable_to_cast_date_type: {
            value: {
              statusCode: 400,
              message: 'start_date and/or end_date are not a correct time',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  async create_appointment(
    @Body() dto: CreateAppointmentDto,
    @GetCurrentUserId() doctorId: mongoose.Types.ObjectId,
  ) {
    return this.appointmentService.create_appointment(dto, doctorId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('PATIENT')
  @Patch(':appointment_id/confirm_appointment')
  @ApiOperation({ summary: 'Patient confirm appoinment' })
  @ApiOkResponse({
    schema: {
      example: {
        msg: 'Appointment confirmed',
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
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: {
            value: {
              statusCode: 400,
              message: 'Id is not in valid format',
              error: 'Bad Request',
            },
          },
          No_appointment_for_this_user: {
            value: {
              statusCode: 400,
              message: 'No appointment for this patient',
              error: 'Bad Request',
            },
          },
          Wrong_status: {
            value: {
              statusCode: 400,
              message: 'Appointment is not in the CREATED status',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  async confirm_appointment(
    @Param('appointment_id') appointment_id: string,
    @GetCurrentUserId() patient_id: mongoose.Types.ObjectId,
  ) {
    return this.appointmentService.confirm_appointment(
      appointment_id,
      patient_id,
    );
  }

  @ApiOkResponse({
    schema: {
      example: {
        msg: 'Appointment canceled',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('PATIENT', 'DOCTOR')
  @Patch(':appointment_id/cancel_appointment')
  @ApiOperation({ summary: 'Patient/Doctor cancel the appoinment' })
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
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: {
            value: {
              statusCode: 400,
              message: 'Id is not in valid format',
              error: 'Bad Request',
            },
          },
          No_appointment_for_this_user: {
            value: {
              statusCode: 400,
              message: 'No appointment for this patient',
              error: 'Bad Request',
            },
          },
          Wrong_status: {
            value: {
              statusCode: 400,
              message: 'Appointment is not in the CONFIRMED or CREATED status',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  async cancel_appointment(
    @Param('appointment_id') appointment_id: string,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    return this.appointmentService.cancel_appointment(appointment_id, userId);
  }

  @ApiOkResponse({
    schema: {
      example: {
        msg: 'Appointment completed with payment info',
      },
    },
  })
  @ApiBody({
    type: paymentInfoDto,
    examples: {
      example1: {
        value: {
          amount: 0,
          status: 'string',
          method: 'string',
          date: '2023-11-07T12:30:00',
        },
        summary: 'An example appointment request ',
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
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: {
            value: {
              statusCode: 400,
              message: 'Id is not in valid format',
              error: 'Bad Request',
            },
          },
          No_appointment_for_this_user: {
            value: {
              statusCode: 400,
              message: 'No appointment for this doctor',
              error: 'Bad Request',
            },
          },
          Wrong_status: {
            value: {
              statusCode: 400,
              message: 'Appointment is not in the CONFIRMED status',
              error: 'Bad Request',
            },
          },
          Date_format: {
            value: {
              statusCode: 400,
              message: [
                'date must match /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$/ regular expression',
              ],
              error: 'Bad Request',
            },
          },
          Unable_to_cast_date_type: {
            value: {
              statusCode: 400,
              message: 'date are not a correct time',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Patch(':appointment_id/complete_appointment')
  @ApiOperation({
    summary: 'Marks the appointment completed and adds Payment Info',
  })
  async complete_appointment(
    @GetCurrentUserId() doctor_id,
    @Param('appointment_id') appointment_id: string,
    @Body() dto: paymentInfoDto,
  ) {
    return this.appointmentService.complete_appointment(
      doctor_id,
      appointment_id,
      dto,
    );
  }

  @ApiOkResponse({
    schema: {
      example: {
        docs: [
          {
            _id: 'string',
            patient_id: 'string',
            doctor_id: 'string',
            start_date: '2023-12-07T12:30:00.000Z',
            end_date: '2023-12-07T12:50:00.000Z',
            status: ['CREATED'],
            __v: 0,
          },
          {
            _id: 'string',
            patient_id: 'string',
            title: 'Cool appointment',
            doctor_id: 'string',
            start_date: '2023-11-07T10:30:00.000Z',
            end_date: '2023-11-07T10:40:00.000Z',
            status: ['CREATED'],
            __v: 0,
          },
          {
            _id: 'string',
            patient_id: 'string',
            title: 'title',
            doctor_id: 'string',
            start_date: '2023-11-07T10:30:00.000Z',
            end_date: '2023-11-07T11:30:00.000Z',
            status: ['CONFIRMED'],
            __v: 0,
          },
        ],
        totalDocs: 3,
        limit: 25,
        totalPages: 1,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      },
    },
  })
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gets all the appointment for a doctor',
  })
  @Get('doctor/appointment')
  async get_doctor_appointment(
    @GetCurrentUserId() doctor_id,
    @Query() { page }: PaginationParams,
  ) {
    return this.appointmentService.get_doctor_appointment(doctor_id, page);
  }

  @ApiOkResponse({
    schema: {
      example: {
        docs: [
          {
            _id: 'string',
            patient_id: 'string',
            doctor_id: 'string',
            start_date: '2023-12-07T12:30:00.000Z',
            end_date: '2023-12-07T12:50:00.000Z',
            status: ['CREATED'],
            __v: 0,
          },
          {
            _id: 'string',
            patient_id: 'string',
            title: 'Cool appointment',
            doctor_id: 'string',
            start_date: '2023-11-07T10:30:00.000Z',
            end_date: '2023-11-07T10:40:00.000Z',
            status: ['CREATED'],
            __v: 0,
          },
          {
            _id: 'string',
            patient_id: 'string',
            title: 'title',
            doctor_id: 'string',
            start_date: '2023-11-07T10:30:00.000Z',
            end_date: '2023-11-07T11:30:00.000Z',
            status: ['CONFIRMED'],
            __v: 0,
          },
        ],
        totalDocs: 3,
        limit: 25,
        totalPages: 1,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      },
    },
  })
  @UseGuards(RolesGuard)
  @Roles('PATIENT')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gets all the appointment for a patient',
  })
  @Get('patient/appointment')
  async get_patient_appointment(
    @GetCurrentUserId() patient_id,
    @Query() { page }: PaginationParams,
  ) {
    return this.appointmentService.get_patient_appointment(patient_id, page);
  }

  @Get('get_payment_info')
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gets Payment Info for a doctor' })
  async get_paymentInfo(
    @GetCurrentUserId() doctor_id,
    @Query() { page }: PaginationParams,
  ) {
    return this.appointmentService.get_all_paymentInfo(doctor_id, page);
  }
}
