import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon from 'argon2';
import { Http2ServerResponse } from 'http2';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument, UserRole } from 'src/auth/schema/user.schema';

import { AuthDto } from './dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtPayload, Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private config: ConfigService,
  ) {}
  async signupLocal(dto: CreateUserDto): Promise<Tokens> {
    const temp = await this.findByEmail(dto.email);
    if (temp) {
      throw new ForbiddenException('Email already in use');
    }
    if (dto.confirmPassword != dto.password) {
      throw new ForbiddenException('Passwords do not match');
    }
    const hash = await argon.hash(dto.password);
    const user: User = await this.userModel.create({
      email: dto.email,
      password: hash,
      role: UserRole.PATIENT,
      firstName: dto.firstName,
      lastName: dto.lastName,
      hashedRt: 'test',
    });

    const tokens = await this.getTokens(user._id, user.email);
    await this.updateRtHash(user._id, tokens.refresh_token);

    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.userModel.findOne({
      email: dto.email,
    });

    if (!user)
      throw new ForbiddenException('No user with current email adress');

    const passwordMatches = await argon.verify(user.password, dto.password);

    if (!passwordMatches) throw new ForbiddenException('Incorrect password');

    const tokens = await this.getTokens(user._id, user.email);
    await this.updateRtHash(user._id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: mongoose.Types.ObjectId): Promise<any> {
    const resp = await this.userModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        hashedRt: 'null',
      },
    );

    return { msg: 'logged out' };
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

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user._id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(
    userId: mongoose.Types.ObjectId,
    rt: string,
  ): Promise<void> {
    const hash = await argon.hash(rt);
    console.log(await this.userModel.find({ _id: userId }));

    await this.userModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        hashedRt: hash,
      },
    );
  }

  async getTokens(
    userId: mongoose.Types.ObjectId,
    email: string,
  ): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: 'AT_SECRET',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: 'RT_SECRET',
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email: email });
  }
}
