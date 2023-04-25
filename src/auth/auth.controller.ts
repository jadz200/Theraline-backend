import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import mongoose from 'mongoose';
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
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { Public, GetCurrentUserId } from '../common/decorators/index';

import { AuthService } from './auth.service';
import {
  AuthResponse,
  RetrieveUserDTO,
  CreateUserDto,
  AuthDto,
} from './dto/index';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RefreshDto } from './dto/refresh.dto';

import {
  SwaggerCreateUserReq,
  SwaggerBadResponseMessage,
  SwaggerResponseSuccessfulWithMessage,
  SwaggerUnauthorizedResponse,
  SwaggerSignInReq,
  SwaggerUnauthorizedResponseMessage,
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
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Create patient user' })
  @Public()
  @Post('signup')
  async signupLocal(@Body() dto: CreateUserDto) {
    const dtoCopy = { ...dto };
    if (dto.image) {
      dtoCopy.image = (await this.cloudinaryService.uploadImage(dto.image)).url;
    }
    return this.authService.signupLocal(dtoCopy);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Successful Response',
    type: AuthDto,
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
  @UsePipes(ValidationPipe)
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
          No_Refresh_Token:
            SwaggerUnauthorizedResponseMessage('No Refresh token'),
          Incorrect_Refresh_Token_Format: SwaggerUnauthorizedResponseMessage(
            'Wrong Refresh Token format',
          ),
          No_User: SwaggerUnauthorizedResponseMessage(
            'No user with this token',
          ),
          No_Match: SwaggerUnauthorizedResponseMessage(
            'Incorrect Refresh token',
          ),
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
