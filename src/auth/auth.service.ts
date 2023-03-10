import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { BadRequestException, HttpException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon from 'argon2';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument, UserRole } from 'src/auth/schema/user.schema';
import { MsgDto } from 'src/common/dto/msg.dto';

import { AuthResponse } from './dto/auth-response.dto';
import { AuthDto } from './dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RetrieveUserDTO } from './dto/retrieve-user.dto';
import { JwtPayload } from './types/jwtPayload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}
  async signupLocal(dto: CreateUserDto): Promise<MsgDto> {
    const temp = await this.findByEmail(dto.email);
    if (temp) {
      throw new BadRequestException('Email already in use');
    }
    const hash = await argon.hash(dto.password);
    await this.userModel.create({
      email: dto.email,
      password: hash,
      role: 'PATIENT',
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    return { msg: 'Created account' };
  }

  async signinLocal(dto: AuthDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({
      email: dto.email,
    });

    if (!user)
      throw new ForbiddenException('No user with current email adress');

    const passwordMatches = await argon.verify(user.password, dto.password);

    if (!passwordMatches) throw new BadRequestException('Incorrect password');

    const tokens = await this.getTokens(user._id, user.email, user.role);
    await this.updateRtHash(user._id, tokens.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      role: user.role,
    };
  }

  async refreshTokens(
    userId: mongoose.Types.ObjectId,
    rt: string,
  ): Promise<Tokens> {
    const user = await this.userModel.findOne({
      _id: userId,
    });
    if (!user || !user.hashedRt)
      throw new ForbiddenException('No user with this token');

    const rtMatches = await argon.verify(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Incorrect Refresh token');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user._id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(
    userId: mongoose.Types.ObjectId,
    rt: string,
  ): Promise<void> {
    const hash = await argon.hash(rt);

    const user: User = await this.userModel.findOne({
      _id: userId,
    });
    if (user.hashedRt == null) {
      await this.userModel.updateOne(user, {
        $set: { hashedRt: hash },
      });
    } else {
      await this.userModel.updateOne(user, { hashedRt: hash });
    }
  }

  async getTokens(
    userId: mongoose.Types.ObjectId,
    email: string,
    role: UserRole,
  ): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
      role: role,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: 'AT_SECRET',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: 'RT_SECRET',
        expiresIn: '30d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async retrieveUserInfo(
    id: mongoose.Types.ObjectId,
  ): Promise<RetrieveUserDTO> {
    const user = await this.findById(id.toString());
    const userInfo: RetrieveUserDTO = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return userInfo;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email: email });
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.userModel.findOne({ _id: id });
  }
}
