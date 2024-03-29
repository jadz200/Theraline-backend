import { Injectable, Logger } from '@nestjs/common';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon from 'argon2';
import mongoose, { PaginateModel } from 'mongoose';
import { User, UserDocument, UserRole } from './schema/user.schema';
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
      email: dto.email.toLowerCase(),
      password: hash,
      role: 'PATIENT',
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      birthday: dto.birthday,
      gender: dto.gender,
      image: dto.image,
      expoToken: dto.expoToken,
      username: dto.username,
    });
    this.logger.log(`Created new user ${user.id} as a ${user.role}`);

    return { msg: 'Created Patient Account' };
  }

  async signin(dto: AuthDto): Promise<AuthResponse> {
    const user: User = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });

    if (!user)
      throw new BadRequestException('No user with current email adress');

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
    const [bearer, token] = rt.split(' ');
    if (bearer !== 'Bearer')
      throw new UnauthorizedException('Wrong Refresh Token format');

    let userId;
    try {
      userId = this.jwtService.decode(token).sub;
    } catch {
      throw new UnauthorizedException('Wrong Refresh Token format');
    }
    const user = await this.userModel.findOne({
      _id: userId,
    });
    if (!user || !user.hashedRt)
      throw new UnauthorizedException('No user with this token');
    const rtMatches = await argon.verify(user.hashedRt, token);

    if (!rtMatches) throw new UnauthorizedException('Incorrect Refresh token');
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
      email,
      role,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('AT_SECRET'),
        expiresIn: '15d',
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
    const user = await this.userModel
      .findOne({ _id: id })
      .select('_id email firstName lastName phone image');
    this.logger.log(`retrieved user ${user._id} information`);
    return {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      image: user.image,
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<User | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    return this.userModel.findOne({ _id: id }).select('role');
  }

  async getPatientProfile(id: string): Promise<User | undefined> {
    return this.userModel
      .findOne({ _id: id })
      .select('firstName lastName username email image ');
  }

  async getName(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const user = await this.userModel.findOne({ _id: id });
    return user.fullName;
  }

  async getUsername(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const user = await this.userModel.findOne({ _id: id });
    return user.username;
  }
}
