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

import { AuthService } from './auth.service';
import { UserRole } from './schema/user.schema';
import { RetrieveUserDTO } from './dto/retrieve-user.dto';
import { MsgDto } from 'src/common/dto/msg.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { Token } from './dto/token.entity';
import { Tokens } from './types/tokens.type';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { RtGuard } from 'src/common/guards/rt.guard';

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
  signupLocal(@Body() dto: CreateUserDto): Promise<MsgDto> {
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
  signinLocal(@Body() dto: AuthDto): Promise<AuthResponse> {
    return this.authService.signinLocal(dto);
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
