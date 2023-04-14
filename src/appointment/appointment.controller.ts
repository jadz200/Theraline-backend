import { Body, Controller, Post } from '@nestjs/common';
import { Get, Param, Patch, Query, UseGuards } from '@nestjs/common/decorators';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
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
          paymentInfo: {
            amount: 100,
            status: 'Paid',
            method: 'Credit Card',
            date: '2023-03-18T16:00:00',
          },
        },
        summary: 'An example appointment request',
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
  async confirm_appointment(
    @Param('appointment_id') appointment_id: string,
    @GetCurrentUserId() patient_id: mongoose.Types.ObjectId,
  ) {
    return this.appointmentService.confirm_appointment(
      appointment_id,
      patient_id,
    );
  }

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
  async cancel_appointment(
    @Param('appointment_id') appointment_id: string,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    return this.appointmentService.cancel_appointment(appointment_id, userId);
  }
  @ApiBearerAuth()
  @Get('doctor/appointment')
  async get_doctor_appointment(
    @GetCurrentUserId() doctor_id,
    @Query() { page }: PaginationParams,
  ) {
    return this.appointmentService.get_doctor_appointment(doctor_id, page);
  }

  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiBearerAuth()
  @Patch(':appointment_id/complete_appointment')
  @ApiOperation({
    summary: 'Marks the appointment completed and adds Payment Info',
  })
  async complete_appointment(
    @Param('appointment_id') appointment_id: string,
    @Body() dto: paymentInfoDto,
  ) {
    this.appointmentService.complete_appointment(appointment_id, dto);
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
