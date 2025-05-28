import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common/services/logger.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Session from "./session.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        private jwtService: JwtService,
    ) { }

    private readonly logger = new Logger(SessionService.name);
    async createSession(userId: string, userAgent: string, ip: string) {
        const token = this.jwtService.sign(
            { userId },
            { expiresIn: '7d' } // Устанавливаем срок действия токена на 7 дней
        )

        const session = this.sessionRepository.create({
            userId,
            token,
            userAgent,
            ip,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Устанавливаем дату истечения срока действия
        });

        return await this.sessionRepository.save(session);
    }

    async findSessionByUserId(id: string) {
        return await this.sessionRepository.findOne({
            where: { id },
            relations: ['user']
        })
    }

    async findSession(token: string) {
        return await this.sessionRepository.findOne({
            where: { token },
            relations: ['user']
        });
    }

    async deleteSession(token: string) {
        const session = await this.sessionRepository.findOne({
            where: { token }
        });
        if (session) {
            return await this.sessionRepository.remove(session);
        }
    }
}