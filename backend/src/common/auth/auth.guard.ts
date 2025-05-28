import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SessionService } from "src/session/session.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService
    ) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies['auth_token'];

        if (!token) {
            throw new UnauthorizedException('Требуется авторизация');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            const session = await this.sessionService.findSession(token);

            if (!session) {
                throw new UnauthorizedException('Сессия не найдена');
            }

            request.user = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Неверный токен авторизации');
        }
    }
}