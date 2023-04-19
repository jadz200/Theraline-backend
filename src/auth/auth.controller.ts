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

import {
  SwaggerCreateUserReq,
  SwaggerBadResponseMessage,
  SwaggerResponseSuccessfulWithMessage,
  SwaggerUnauthorizedResponse,
  SwaggerSignInReq,
} from '../common/swagger';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @ApiBody({
    type: CreateUserDto,
    examples: SwaggerCreateUserReq,
  })
  @ApiCreatedResponse(SwaggerResponseSuccessfulWithMessage('Created account'))
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: 'string',
        error: 'Bad Request',
      },
    },
  })
  @ApiOperation({ summary: 'Create patient user' })
  @Public()
  @Post('signup')
  async signupLocal(@Body() dto: CreateUserDto) {
    if (dto.image) {
      dto.image = (await this.cloudinaryService.upload(dto.image)).url;
    }
    return this.authService.signupLocal(dto);
  }

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
          Incorrect_Password: SwaggerBadResponseMessage('Incorrect password'),
          No_User_with_email: SwaggerBadResponseMessage(
            'No user with current email adress',
          ),
        },
      },
    },
  })
  @ApiBody({
    type: AuthDto,
    examples: SwaggerSignInReq,
  })
  @ApiOperation({ summary: 'Sign in and get access and refresh tokens' })
  @Public()
  @Post('signin')
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use Refresh token' })
  @ApiBearerAuth()
  @Post('refresh')
  refreshTokens(@Headers('Authorization') refresh_token) {
    console.log(refresh_token);
    if (!refresh_token) throw new UnauthorizedException('No Refresh token');
    return this.authService.refreshTokens(refresh_token);
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
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Use Access token get user info' })
  @Get('me')
  async retrieveUserInfo(
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<RetrieveUserDTO> {
    return this.authService.retrieveUserInfo(userId);
  }
}
