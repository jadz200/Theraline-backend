import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { Roles } from './common/decorators/roles.decorator';
import { RolesGuard } from './common/guards/roles.guard';
import {
  SwaggerForbiddenResponse,
  SwaggerResponseSuccessfulWithMessage,
  SwaggerUnauthorizedResponse,
} from './common/swagger/response.swagger';

@ApiTags('Main')
@Controller()
export class AppController {
  @Public()
  @Get('/')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse(SwaggerResponseSuccessfulWithMessage('Hello World'))
  healthcheck() {
    return { msg: 'Hello World' };
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @Get('/doctor')
  @ApiOkResponse(SwaggerResponseSuccessfulWithMessage('Hello doctors'))
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiOperation({ summary: 'Checking doctor permission' })
  doctor() {
    return { msg: 'Hello doctors' };
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('PATIENT')
  @Get('/patient')
  @ApiOkResponse(SwaggerResponseSuccessfulWithMessage('Hello patient'))
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiOperation({ summary: 'Checking patient permission' })
  patient() {
    return { msg: 'Hello patient' };
  }
}
