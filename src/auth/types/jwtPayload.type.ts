import mongoose from 'mongoose';

export type JwtPayload = {
  email: string;
  sub: mongoose.Types.ObjectId;
};
