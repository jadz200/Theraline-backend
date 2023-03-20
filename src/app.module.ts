import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards/at.guard';
import { GroupsModule } from './groups/groups.module';
import { MessagesModule } from './messages/messages.module';
import { AppointementModule } from './appointement/appointement.module';
import { PatientModule } from './patient/patient.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        uri: 'mongodb+srv://theraline-admin:Y9incPeXT3lHtP9R@cluster0.aojjvwq.mongodb.net/?retryWrites=true&w=majority',
      }),
    }),
    AuthModule,
    GroupsModule,
    MessagesModule,
    AppointementModule,
    PatientModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
