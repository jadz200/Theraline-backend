import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { Roles } from './common/decorators/roles.decorator';
import { RolesGuard } from './common/guards/roles.guard';

@ApiTags('Main')
@Controller()
export class AppController {
  @Public()
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
