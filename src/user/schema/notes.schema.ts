import { Prop } from '@nestjs/mongoose';

export class Notes {
  @Prop()
  author: string;

  @Prop()
  title: string;

  @Prop()
  body: string;
}
