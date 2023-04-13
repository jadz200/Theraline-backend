import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import mongoose from 'mongoose';
import {
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
  ApiHeader,
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
} from './dto/index';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RtGuard } from 'src/common/guards';
import { BadRequestException } from '@nestjs/common/exceptions';

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
        phone: {
          type: 'string',
        },
        gender: {
          type: 'string',
        },
        birthday: {
          type: 'string',
        },
        expoToken: {
          type: 'string',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['firstName', 'lastName', 'email', 'password'],
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
      expotoken: {
        value: {
          email: 'doctor@gmail.com',
          password: 'string',
          expoToken: 'string',
        },
        summary: 'Login expo Token example',
      },
    },
  })
  @ApiOperation({ summary: 'Sign in and get access and refresh tokens' })
  async signinLocal(@Body() dto: AuthDto): Promise<AuthResponse> {
    return this.authService.signin(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use Refresh token' })
  @ApiHeader({
    name: 'refreshToken',
    required: true,
    description: 'The refresh token to use for authentication',
  })
  refreshTokens(@Headers() headers: { refreshToken: string }) {
    if (!headers['refreshtoken'])
      throw new BadRequestException('No Refresh token');
    return this.authService.refreshTokens(headers['refreshtoken']);
  }

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
  @Get('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use Access token get user info' })
  async retrieveUserInfo(
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<RetrieveUserDTO> {
    return this.authService.retrieveUserInfo(userId);
  }
}
