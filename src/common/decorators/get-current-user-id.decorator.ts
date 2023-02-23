import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import mongoose from 'mongoose';
import { JwtPayload } from 'src/auth/types/jwtPayload.type';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): mongoose.Types.ObjectId => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return user.sub;
  },
);
