import { PaymentInfo } from '../schema';

export class GetpaymentInfoDto {
  _id: string;

  patient_id: string;

  fullName?: string;

  email?: string;

  image?: string;

  paymentInfo: PaymentInfo;
}
