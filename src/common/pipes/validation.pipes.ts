import { ValidationPipe } from '@nestjs/common';

export const trasnformPipe = new ValidationPipe({
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  transform: true,
});
