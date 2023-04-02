import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
  ) {}

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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiOperation({ summary: 'Create patient user' })
  @UseInterceptors(FileInterceptor('image', { dest: './uploads' }))
  async signupLocal(
    @Body() dto: CreateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    console.log(image);
    if (typeof image !== 'undefined') {
      dto.image = (await this.cloudinaryService.upload(image)).url;
    }
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
  async signinLocal(@Body() dto: AuthDto): Promise<AuthResponse> {
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
  async retrieveUserInfo(
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
  @ApiBody({
    description: 'Data required to create a new doctor',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
        image: { type: 'string', format: 'binary' },
        clinicInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            location: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @UseInterceptors(FileInterceptor('image', { dest: './uploads' }))
  async create_doctor(
    @Body() dto: CreateDoctorDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (typeof dto.clinicInfo === 'string') {
      dto.clinicInfo = JSON.parse(dto.clinicInfo);
    }
    if (dto.image == '') {
      dto.image = undefined;
    }
    if (dto.image) {
      dto.image = (await this.cloudinaryService.upload(image)).url;
    }
    return this.authService.createDoctor(dto);
  }
}
