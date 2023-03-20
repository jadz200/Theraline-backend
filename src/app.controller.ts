import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from './common/decorators/roles.decorator';
import { RolesGuard } from './common/guards/roles.guard';

@ApiTags('Main')
@Controller()
export class AppController {
  @Get('/')
  healthcheck() {
    return { msg: 'Hello World' };
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @Get('/doctor')
  doctor() {
    return { msg: 'Hello doctors' };
  }
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('PATIENT')
  @Get('/patient')
  patient() {
    return { msg: 'Hello doctors' };
  }
}
