import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { Roles } from './common/decorators/roles.decorator';
import { RolesGuard } from './common/guards/roles.guard';

@ApiTags('Main')
@Controller()
export class AppController {
  @Public()
  @Get('/')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'Successful Response',
    schema: {
      example: {
        msg: 'Hello World',
      },
    },
  })
  healthcheck() {
    return { msg: 'Hello World' };
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @Get('/doctor')
  @ApiOkResponse({
    description: 'Successful Response',
    schema: {
      example: {
        msg: 'Hello doctors',
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
  @ApiOperation({ summary: 'Checking doctor permission' })
  doctor() {
    return { msg: 'Hello doctors' };
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('PATIENT')
  @Get('/patient')
  @ApiOkResponse({
    description: 'Successful Response',
    schema: {
      example: {
        msg: 'Hello patient',
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
  @ApiOperation({ summary: 'Checking patient permission' })
  patient() {
    return { msg: 'Hello patient' };
  }
}
