import { Prop } from '@nestjs/mongoose';

export class ClinicInfo {
  @Prop()
  phone: string;

  @Prop()
  location: string;

  @Prop()
  name: string;
}
