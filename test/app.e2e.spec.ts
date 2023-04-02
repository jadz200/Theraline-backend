import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthModule } from '../src/auth/auth.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  it('/ (GET)', () => {
    return request(server).get('/').expect(200).expect('{"msg":"Hello World"}');
  });

  it('/patient (GET)', async () => {
    const res = await request(server).post('/auth/signin').send({
      email: process.env.PATIENT_EMAIL,
      password: process.env.USER_PASSWORD,
    });
    const bearerToken = res.body['access_token'];
    return request(server)
      .get('/patient')
      .expect(200)
      .set('Authorization', `Bearer ${bearerToken}`)
      .expect('{"msg":"Hello patient"}');
  });

  it('/doctor (GET)', async () => {
    const res = await request(server).post('/auth/signin').send({
      email: process.env.DOCTOR_EMAIL,
      password: process.env.USER_PASSWORD,
    });
    const bearerToken = res.body['access_token'];
    return request(server)
      .get('/doctor')
      .expect(200)
      .set('Authorization', `Bearer ${bearerToken}`)
      .expect('{"msg":"Hello doctors"}');
  });
});
