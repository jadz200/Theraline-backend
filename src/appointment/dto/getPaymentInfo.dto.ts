import { ObjectId } from 'mongoose';
import { paymentInfoDto } from './createAppointment.dto';

export class GetpaymentInfoDto {
  _id: string;
  patient_id?: string;
  fullName?: string;
  email?: string;
  image?: string;
  paymentInfo?: paymentInfoDto;
}
