import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon from 'argon2';
import mongoose, { PaginateModel } from 'mongoose';
import { User, UserDocument, UserRole } from '../auth/schema/user.schema';
import {
  AuthResponse,
  AuthDto,
  CreateUserDto,
  RetrieveUserDTO,
} from './dto/index';
import { JwtPayload, Tokens } from './types/index';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
  ) {}

  async signupLocal(dto: CreateUserDto) {
    const temp = await this.findByEmail(dto.email);
    if (temp) {
      throw new BadRequestException('Email already in use');
    }
    const hash = await argon.hash(dto.password);
    const user = await this.userModel.create({
      email: dto.email,
      password: hash,
      role: 'PATIENT',
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      birthday: dto.birthday,
      gender: dto.gender,
      image: dto.image,
      expoToken: dto.expoToken,
    });
    this.logger.log(`Created new user ${user.id} as a ${user.role}`);

    return { msg: 'Created Patient Account' };
  }

  async signin(dto: AuthDto): Promise<AuthResponse> {
    const user: User = await this.userModel.findOne({
      email: dto.email,
    });

    if (!user)
      throw new ForbiddenException('No user with current email adress');

    const passwordMatches = await argon.verify(user.password, dto.password);

    if (!passwordMatches) throw new BadRequestException('Incorrect password');
    if (!user.expoToken || user.expoToken !== dto.expoToken) {
      await this.userModel.updateOne(user, {
        $set: { expoToken: dto.expoToken },
      });
    }

    const tokens: Tokens = await this.getTokens(
      user._id,
      user.email,
      user.role,
    );
    await this.updateRtHash(user._id, tokens.refresh_token);
    this.logger.log(`User ${user._id} logged in`);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      role: user.role,
    };
  }

  async refreshTokens(rt: string) {
    const userId = this.jwtService.decode(rt)['sub'];
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
        secret: this.configService.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('RT_SECRET'),
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
    this.logger.log(`retrieved user ${user._id} information`);
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email: email });
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.userModel.findOne({ _id: id });
  }
  async getPatientProfile(id: string): Promise<User | undefined> {
    return await this.userModel
      .findOne({ _id: id })
      .select('firstName lastName email image');
  }
}
