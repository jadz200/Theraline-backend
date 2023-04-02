import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/sign-in (GET)', () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: process.env.PATIENT_EMAIL,
        password: process.env.USER_PASSWORD,
      })
      .expect(200);
  });
});
