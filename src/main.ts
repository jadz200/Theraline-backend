import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const clinicInfoSchema = {
  schema: {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      image: { type: 'string', format: 'binary' },
      clinicInfo: {
        type: 'object',
        format: 'json',
        properties: {
          phone: { type: 'string' },
          location: { type: 'string' },
        },
        required: ['phone', 'location'],
      },
    },
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Theraline endpoints')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  console.log(document.components);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      displayRequestDuration: true,
    },
  });
  await app.listen(3000);
}
bootstrap();
