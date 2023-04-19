import { paymentInfoDto } from './createAppointment.dto';

export class GetpaymentInfoDtoList {
  paymentList: GetpaymentInfoDto[];
}
export class GetpaymentInfoDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  paymentInfo?: paymentInfoDto;
}
