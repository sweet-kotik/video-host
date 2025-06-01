import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoModule } from './video/video.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './video/video.entity';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { SessionModule } from './session/session.module';
import Session from './session/session.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_LOGIN,
      password: process.env.POSTGRES_PASS,
      database: process.env.POSTGRES_DATABASE,
      entities: [Video, User, Session],
      synchronize: process.env.NODE_ENV !== 'production',
      retryAttempts: 10,
      retryDelay: 3000,
      ssl: false,
      extra: {
        ssl: false
      },
      logging: process.env.NODE_ENV !== 'production',
    }),
    VideoModule,
    UserModule,
    SessionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
