import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
//import * as fs from 'fs';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('./certs/private.key'),
  //   cert: fs.readFileSync('./certs/certificate.crt'),
  // };

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    //httpsOptions,
    cors: {
      origin: [
        "https://play-sphere.ru",
        "https://www.play-sphere.ru",
        "https://45.134.12.79",
        "https://localhost",
        "https://127.0.0.1",
        "http://localhost",
        "http://frontend"
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      "preflightContinue": false,
    },
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.BACKEND_PORT ?? 3001);
}
bootstrap();
