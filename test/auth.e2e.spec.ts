import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });
  afterEach(async () => {
    await app.close();
    server.close();
  });

  it('/sign-in (GET)', async () => {
    const res = await request(server).post('/auth/signin').send({
      email: process.env.PATIENT_EMAIL,
      password: process.env.USER_PASSWORD,
    });
    expect(res.status).toBe(200);
  });

  it('/me (GET)', async () => {
    const res = await request(server).post('/auth/signin').send({
      email: process.env.PATIENT_EMAIL,
      password: process.env.USER_PASSWORD,
    });
    const bearerToken = res.body.access_token;

    return request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${bearerToken}`)
      .expect(200);
  });
});
