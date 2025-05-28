import { Module } from "@nestjs/common";
import { SessionService } from "./session.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import Session from "./session.entity";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        TypeOrmModule.forFeature([Session]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [SessionService],
    exports: [SessionService, JwtModule]
})
export class SessionModule { }