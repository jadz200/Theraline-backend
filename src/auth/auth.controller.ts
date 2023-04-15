import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { Public, GetCurrentUserId } from '../common/decorators/index';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
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
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { RefreshDto } from './dto/refresh.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @ApiBody({
    type: CreateUserDto,
    examples: {
      Required_Fields: {
        value: {
          firstName: 'string',
          lastName: 'string',
          email: 'string',
          password: 'string',
        },
        summary: 'Required field',
      },
      ExpoToken: {
        value: {
          firstName: 'string',
          lastName: 'string',
          email: 'string',
          password: 'string',
          expoToken: 'string',
        },
        summary: 'Required field + Expo Token',
      },
      Image: {
        value: {
          firstName: 'string',
          lastName: 'string',
          email: 'string',
          password: 'string',
          image: 'string',
        },
        summary: 'Required field + Image Base64',
      },
    },
  })
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
  async signupLocal(@Body() dto: CreateUserDto) {
    if (dto.image) {
      dto.image = (await this.cloudinaryService.upload(dto.image)).url;
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
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Incorrect_Password: {
            value: {
              statusCode: 400,
              message: 'Incorrect password',
              error: 'Bad Request',
            },
          },
          No_User_with_email: {
            value: {
              statusCode: 400,
              message: 'No user with current email adress',
              error: 'Bad Request',
            },
          },
        },
      },
    },
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

  @ApiResponse({
    status: 401,
    description: 'Unauthorized error',
    content: {
      'application/json': {
        examples: {
          No_Refresh_Token: {
            value: {
              statusCode: 401,
              message: 'No Refresh token',
              error: 'Bad Request',
            },
          },
          Incorrect_Refresh_Token_Format: {
            value: {
              statusCode: 401,
              message: 'Wrong Refresh Token format',
              error: 'Bad Request',
            },
          },
          No_User: {
            value: {
              statusCode: 401,
              message: 'No user with this token',
              error: 'Bad Request',
            },
          },
          No_Match: {
            value: {
              statusCode: 401,
              message: 'Incorrect Refresh token',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiOkResponse({
    type: RefreshDto,
  })
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
      throw new UnauthorizedException('No Refresh token');
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
