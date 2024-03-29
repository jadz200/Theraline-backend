import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import {
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common/decorators';
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
import mongoose, { PaginateResult } from 'mongoose';
import { trasnformPipe } from '../common/pipes/validation.pipes';
import { PaginationParams } from '../common/dto/paginationParams.dto';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppointmentService } from './appointment.service';
import {
  CreateAppointmentDto,
  EditAmountDto,
  GetpaymentInfoDto,
  PaymentInfoDto,
} from './dto/index';
import {
  SwaggerResponseSuccessfulWithMessage,
  SwaggerUnauthorizedResponse,
  SwaggerForbiddenResponse,
  SwaggerBadResponseMessage,
  SwaggerGetAppointmentResp,
  SwaggerGetPaymentInfoResp,
  SwaggerGetMonthlyPaymentCountResp,
} from '../common/swagger';
import { Appointment } from './schema';
import { PaymentStatsDto } from './dto/paymentStats.dto';
import { AppointmentStatsDto } from './dto/appointmentsStats.dto';
import { GetAppointmentDto } from './dto/getAppointmentsDto';

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
  })
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponseMessage('Id is not in valid format'),
          Date_format: SwaggerBadResponseMessage([
            'start_date and end_date must match /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$/ regular expression',
          ]),
          Unable_to_cast_date_type: SwaggerBadResponseMessage(
            'start_date and/or end_date are not a correct time',
          ),
        },
      },
    },
  })
  @UsePipes(trasnformPipe)
  async create_appointment(
    @Body() dto: CreateAppointmentDto,
    @GetCurrentUserId() doctorId: mongoose.Types.ObjectId,
  ): Promise<{ msg: string }> {
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
          Invalid_id: SwaggerBadResponseMessage('Id is not in valid format'),
          No_appointment_for_this_user: SwaggerBadResponseMessage(
            'No appointment for this patient',
          ),
          Wrong_status: SwaggerBadResponseMessage(
            'Appointment is not in the CREATED status',
          ),
        },
      },
    },
  })
  async confirm_appointment(
    @Param('appointment_id') appointment_id: string,
    @GetCurrentUserId() patient_id: mongoose.Types.ObjectId,
  ): Promise<{ msg: string }> {
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
          Invalid_id: SwaggerBadResponseMessage('Id is not in valid format'),
          No_appointment_for_this_user: SwaggerBadResponseMessage(
            'No appointment for this patient',
          ),
          Wrong_status: SwaggerBadResponseMessage(
            'Appointment is not in the CONFIRMED or CREATED status',
          ),
        },
      },
    },
  })
  async cancel_appointment(
    @Param('appointment_id') appointment_id: string,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<{ msg: string }> {
    return this.appointmentService.cancel_appointment(appointment_id, userId);
  }

  @ApiOkResponse(
    SwaggerResponseSuccessfulWithMessage(
      'Appointment completed with payment info',
    ),
  )
  @ApiBody({
    type: PaymentInfoDto,
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
          Invalid_id: SwaggerBadResponseMessage('Id is not in valid format'),
          No_appointment_for_this_user: SwaggerBadResponseMessage(
            'No appointment for this doctor',
          ),
          Must_be_CONFIRMED: SwaggerBadResponseMessage(
            'Appointment is not in the CONFIRMED status',
          ),
          Date_format: SwaggerBadResponseMessage([
            'date must match /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$/ regular expression',
          ]),
          Unable_to_cast_date_type: SwaggerBadResponseMessage(
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
  @UsePipes(trasnformPipe)
  async complete_appointment(
    @GetCurrentUserId() doctor_id,
    @Param('appointment_id') appointment_id: string,
    @Body() dto: PaymentInfoDto,
  ): Promise<{ msg: string }> {
    return this.appointmentService.complete_appointment(
      doctor_id,
      appointment_id,
      dto,
    );
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiOkResponse({
    type: GetAppointmentDto,
  })
  @UseGuards(RolesGuard)
  @Roles('DOCTOR', 'PATIENT')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gets all the appointment for a doctor',
  })
  @Get('doctor/appointment')
  async get_doctor_appointment(
    @GetCurrentUserId() userId,
    @Query() { page }: PaginationParams,
  ): Promise<PaginateResult<GetAppointmentDto>> {
    return this.appointmentService.get_doctor_appointment(userId, page);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiOkResponse({
    schema: {
      example: SwaggerGetAppointmentResp,
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
  ): Promise<PaginateResult<Appointment>> {
    return this.appointmentService.get_patient_appointment(patient_id, page);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponseMessage('Id is not in valid format'),
          Appointment_Incomplete: SwaggerBadResponseMessage(
            "Appointment isn't complete",
          ),
          Already_Paid: SwaggerBadResponseMessage('Appointment already paid'),
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
  ): Promise<{ msg: string }> {
    return this.appointmentService.confirm_payment(appointment_id, doctor_id);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiOkResponse({
    schema: {
      example: SwaggerGetPaymentInfoResp,
    },
  })
  @ApiOperation({ summary: 'Gets Payment Info for a doctor' })
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Get('get_payment_info')
  async get_payment_info(
    @GetCurrentUserId() doctor_id,
    @Query() { page }: PaginationParams,
  ): Promise<PaginateResult<GetpaymentInfoDto>> {
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
  @ApiOkResponse(
    SwaggerResponseSuccessfulWithMessage(
      'Payment info for appointment has been  edited',
    ),
  )
  @ApiOperation({ summary: 'Edit Payment Info' })
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @Roles('DOCTOR')
  @UseGuards(RolesGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @Patch(':appointment_id/edit_payment_info')
  async edit_payment_info(
    @Param('appointment_id') appointment_id: string,
    @GetCurrentUserId() doctor_id,
    @Body() dto: EditAmountDto,
  ): Promise<{ msg: string }> {
    return this.appointmentService.edit_payment_info(
      appointment_id,
      doctor_id,
      dto,
    );
  }

  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiOkResponse({ type: PaymentStatsDto })
  @ApiOperation({
    summary: 'Gets the total amount made from payment each week/month/alltime',
  })
  @Roles('DOCTOR')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @Get('payment_stats')
  async get_payment_stats(@GetCurrentUserId() doctorId) {
    return this.appointmentService.get_payment_stats(doctorId);
  }

  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiOkResponse({ type: AppointmentStatsDto })
  @ApiOperation({
    summary:
      'Gets the number of appointment completed and canceled  each week/month/year',
  })
  @Roles('DOCTOR')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @Get('appointment_stats')
  async get_appointment_stats(@GetCurrentUserId() doctorId) {
    return this.appointmentService.get_appointments_chart(doctorId);
  }

  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiOkResponse({
    schema: {
      example: SwaggerGetMonthlyPaymentCountResp,
    },
  })
  @ApiOperation({ summary: 'Gets the number of payment made each month' })
  @Roles('DOCTOR')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @Get('monthly_payment_count')
  async get_monthly_payment_count(@GetCurrentUserId() doctorId) {
    return this.appointmentService.get_monthly_payment_count(doctorId);
  }

  @ApiOkResponse({
    schema: {
      example: 'email sent',
    },
  })
  @ApiBearerAuth()
  @Post(':appointment_id/export_appointment')
  async export_appointment(
    @Param('appointment_id') appointmentId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.appointmentService.export_appointment(appointmentId, userId);
  }
}
