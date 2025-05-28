import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { SessionService } from 'src/session/session.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SessionModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
