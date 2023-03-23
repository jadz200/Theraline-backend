import { Body, Controller, Post } from '@nestjs/common';
import { Param, Put, UseGuards } from '@nestjs/common/decorators';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import mongoose from 'mongoose';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AppointmentService } from './appointement.service';
import { CreateAppointmentDto } from './dto/createAppointement.dto';
@ApiTags('Appointement')
@Controller('appointement')
export class AppointementController {
  constructor(private appointmentService: AppointmentService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @Post('/create_appointement')
  @ApiOperation({ summary: 'Doctor creates appointment' })
  @ApiBody({
    type: CreateAppointmentDto,
    examples: {
      example1: {
        value: {
          patient_id: '1234',
          date: '2023-11-07T12:30:00',
          status: 'Confirmed',
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
  create_appointment(
    @Body() dto: CreateAppointmentDto,
    @GetCurrentUserId() doctorId: mongoose.Types.ObjectId,
  ) {
    return this.appointmentService.create_appointment(dto, doctorId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('PATIENT')
  @Put(':id/confirm_appointement')
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
  confirm_appointment(
    @Param('id') appointment_id: string,
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
  @Put(':id/cancel_appointement')
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
  cancel_appointment(
    @Param('id') appointment_id: string,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    return this.appointmentService.cancel_appointment(appointment_id, userId);
  }
}
