import { Prop } from '@nestjs/mongoose';
import { PaymentMethod, PaymentStatus } from './status.schema';

export class PaymentInfo {
  @Prop()
  amount: number;

  @Prop()
  status: PaymentStatus;

  @Prop()
  method: PaymentMethod;

  @Prop()
  date: Date;
}
