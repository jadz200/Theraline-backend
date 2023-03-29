import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import mongoose from 'mongoose';
import {
  Roles,
  Public,
  GetCurrentUserId,
  GetCurrentUser,
} from '../common/decorators/index';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  AuthResponse,
  RetrieveUserDTO,
  CreateUserDto,
  AuthDto,
  TokenDto,
  CreateDoctorDto,
} from './dto/index';
import { Tokens } from './types/index';
import { RtGuard, RolesGuard } from '../common/guards/index';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiCreatedResponse({
    description: 'Successful Response',
    schema: {
      example: { msg: 'Created account' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['string'],
        error: 'Bad Request',
      },
    },
  })
  @ApiOperation({ summary: 'Create patient user' })
  signupLocal(@Body() dto: CreateUserDto) {
    return this.authService.signupLocal(dto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Successful Response',
    type: TokenDto,
  })
  @ApiBody({
    type: AuthDto,
    examples: {
      patient: {
        value: { email: 'new@gmail.com', password: 'string' },
        summary: 'Patient login',
      },
      doctor: {
        value: { email: 'doctor@gmail.com', password: 'string' },
        summary: 'Doctor login',
      },
    },
  })
  @ApiOperation({ summary: 'Sign in and get access and refresh tokens' })
  signinLocal(@Body() dto: AuthDto): Promise<AuthResponse> {
    return this.authService.signinLocal(dto);
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Successful Response',
    type: TokenDto,
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use Refresh token' })
  refreshTokens(
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Successful Response',
    schema: {
      example: {
        email: 'string@email.com',
        firstName: 'string',
        lastName: 'string',
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use Access token get user info' })
  retrieveUserInfo(
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<RetrieveUserDTO> {
    return this.authService.retrieveUserInfo(userId);
  }

  @Roles('ADMIN')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Creates a doctor' })
  @Post('/create_doctor')
  @ApiCreatedResponse({
    description: 'Successful Response',
    schema: {
      example: {
        msg: 'Created Doctor Account',
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
  create_doctor(@Body() dto: CreateDoctorDto) {
    return this.authService.createDoctor(dto);
  }
}
