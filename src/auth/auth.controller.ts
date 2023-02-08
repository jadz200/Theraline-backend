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
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Public, GetCurrentUserId, GetCurrentUser } from '../common/decorators';
import { RtGuard } from '../common/guards';
import { AuthService } from './auth.service';
import { AuthDto, CreateUserDto, Token, User } from './dto';
import { UserRole } from './schema/user.schema';
import { Tokens } from './types';
import { RetrieveUserDTO } from './dto/retrieve-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiCreatedResponse({
    description: 'Successful Response',
    type: Token,
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
  signupLocal(@Body() dto: CreateUserDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Successful Response',
    type: Token,
  })
  @ApiOperation({ summary: 'Sign in and get access and refresh tokens' })
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Successful Response',
    schema: {
      example: { msg: 'logged out' },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use Access token to log out' })
  logout(@GetCurrentUserId() userId: mongoose.Types.ObjectId): Promise<any> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Successful Response',
    type: Token,
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
        email: 'string',
        firstName: 'string',
        lastName: 'string',
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
}
