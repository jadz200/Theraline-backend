import { Body, Controller, Post } from '@nestjs/common';
import { Get, Param, Patch, Query, UseGuards } from '@nestjs/common/decorators';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
import {
  SwaggerBadResponse,
  SwaggerForbiddenResponse,
  SwaggerResponseSuccessfulWithMessage,
  SwaggerUnauthorizedResponse,
} from '../common/swagger/response.swagger';

@ApiTags('Appointment')
@Controller('appointment')
export class AppointementController {
  constructor(private appointmentService: AppointmentService) {}

  @ApiCreatedResponse(
    SwaggerResponseSuccessfulWithMessage('Created Appointment'),
  )
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
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponse('Id is not in valid format'),
          Date_format: SwaggerBadResponse([
            'start_date and end_date must match /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$/ regular expression',
          ]),
          Unable_to_cast_date_type: SwaggerBadResponse(
            'start_date and/or end_date are not a correct time',
          ),
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
  @ApiOkResponse(SwaggerResponseSuccessfulWithMessage('Appointment confirmed'))
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponse('Id is not in valid format'),
          No_appointment_for_this_user: SwaggerBadResponse(
            'No appointment for this patient',
          ),
          Wrong_status: SwaggerBadResponse(
            'Appointment is not in the CREATED status',
          ),
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

  @ApiOkResponse(SwaggerResponseSuccessfulWithMessage('Appointment canceled'))
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('PATIENT', 'DOCTOR')
  @Patch(':appointment_id/cancel_appointment')
  @ApiOperation({ summary: 'Patient/Doctor cancel the appoinment' })
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponse('Id is not in valid format'),
          No_appointment_for_this_user: SwaggerBadResponse(
            'No appointment for this patient',
          ),
          Wrong_status: SwaggerBadResponse(
            'Appointment is not in the CONFIRMED or CREATED status',
          ),
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

  @ApiOkResponse(
    SwaggerResponseSuccessfulWithMessage(
      'Appointment completed with payment info',
    ),
  )
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
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponse('Id is not in valid format'),
          No_appointment_for_this_user: SwaggerBadResponse(
            'No appointment for this doctor',
          ),
          Must_be_CONFIRMED: SwaggerBadResponse(
            'Appointment is not in the CONFIRMED status',
          ),
          Date_format: SwaggerBadResponse([
            'date must match /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$/ regular expression',
          ]),
          Unable_to_cast_date_type: SwaggerBadResponse(
            'date are not a correct time',
          ),
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

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
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

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
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

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse()
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponse('Id is not in valid format'),
          Appointment_Incomplete: SwaggerBadResponse(
            "Appointment isn't complete",
          ),
          Already_Paid: SwaggerBadResponse('Appointment already paid'),
        },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'Appointment Not Found',
        error: 'Bad Request',
      },
    },
  })
  @ApiOkResponse(SwaggerResponseSuccessfulWithMessage('Appointment  paid'))
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: "Change payment status to paid if it isn't yet" })
  @ApiBearerAuth()
  @Patch(':appointment_id/confirm_payment')
  async confirm_payment(
    @GetCurrentUserId() doctor_id,
    @Param('appointment_id') appointment_id: string,
  ) {
    return this.appointmentService.confirm_payment(appointment_id, doctor_id);
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

  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'Appointment Not Found',
        error: 'Bad Request',
      },
    },
  })
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @Roles('DOCTOR')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @Patch(':appointment_id/edit_payment_info')
  async edit_payment_info(
    @Param('appointmemt_id') appointment_id: string,
    @GetCurrentUserId() doctor_id,
    @Body() amount,
  ) {
    return this.appointmentService.edit_amount(
      appointment_id,
      doctor_id,
      amount,
    );
  }
}
