import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common/services/logger.service';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CreateUserDto from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import * as Minio from 'minio';
import { SessionService } from 'src/session/session.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private sessionService: SessionService,
        private jwtService: JwtService
    ) { }

    async findAll() {
        try {
            return await this.userRepository.find();
        } catch (error) {
            this.logger.error('При получении пользователей произошла ошибка', error.stack);
            throw new Error('Не удалось получить список пользователей');
        }
    }

    async findOne(id: string) {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new Error(`Пользователь с ID ${id} не найден`);
            }
            return user;
        } catch (error) {
            this.logger.error(`Ошибка при получении пользователя с ID ${id}`, error.stack);
            throw new Error('Не удалось получить пользователя');
        }
    }

    async create(data: CreateUserDto, userAgent: string, ip: string) {
        const { username, password, email, file } = data;
        const generatedFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        let filePath = '';
        this.logger.log('Полученные данные для создания пользователя:', username, email);

        let result = (await this.findAll()).map((user) => {
            if (user.email === email) {
                throw new Error('Пользователь с таким Email уже существует');
            }
            return 'Проверка успешна Email уникальный'
        });

        this.logger.log('Результат проверки почти при создании пользователя:', result);



        try {
            // Хэшируем пароль с солью
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            if (file) {
                const minioClient = new Minio.Client({
                    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
                    port: parseInt(process.env.MINIO_PORT || '9000'),
                    useSSL: process.env.MINIO_USE_SSL === 'true',
                    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
                    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
                });

                await minioClient.putObject(
                    process.env.MINIO_BUCKET || 'users',
                    `users/${generatedFilename}-${file.filename}`,
                    file.buffer
                );

                filePath = `${generatedFilename}-${file.filename}`;
            }

            // Создаем и сохраняем нового пользователя
            const newUser = this.userRepository.create({
                username,
                password: hashedPassword,
                email,
                profilePicture: filePath,
                isEmailVerified: false,
                isAdmin: true,
                isBanned: false,
                videoCount: 0,
                subscriberCount: 0,
                viewCount: 0
            });

            const savedUser = await this.userRepository.save(newUser);

            const loginData = await this.login(savedUser.username, savedUser.password, userAgent, ip)

            const { password: _, ...userWithoutPassword } = savedUser;

            return {
                user: userWithoutPassword,
                token: loginData.token,
                sessionId: loginData.session,
                message: 'Пользователь успешно создан и вошел в систему'
            }
        } catch (error) {
            this.logger.error('Ошибка при создании пользователя', error.stack);
            throw new Error('Не удалось создать пользователя');
        }
    }

    async checkToken(token: string) {
        try {
            // Проверяем валидность токена
            const decoded = this.jwtService.verify(token);

            // Проверяем существование пользователя
            const user = await this.userRepository.findOne({
                where: { id: decoded.userId }
            });

            if (!user) {
                throw new Error('Пользователь не найден');
            }

            // Проверяем активность сессии
            const session = await this.sessionService.findSessionByUserId(user.id);
            if (!session) {
                throw new Error('Сессия не найдена');
            }

            return {
                isValid: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            };
        } catch (error) {
            this.logger.error('Ошибка при проверке токена', error.stack);
            return {
                isValid: false,
                error: 'Токен недействителен или истек срок его действия'
            };
        }
    }

    async save(user: User) {
        try {
            return await this.userRepository.save(user);
        } catch (error) {
            this.logger.error('Ошибка при сохранении пользователя', error.stack);
            throw new Error('Не удалось сохранить пользователя');
        }
    }

    async delete(id: string) {
        try {
            const user = await this.userRepository.findOne({ where: { id } });

            if (!user) {
                throw new Error(`Пользователь с ID ${id} не найден`);
            }

            await this.userRepository.remove(user);
            return { message: `Пользователь с ID ${id} успешно удален` };
        } catch (error) {
            this.logger.error(`Ошибка при удалении пользователя с ID ${id}`, error.stack);
            throw new Error('Не удалось удалить пользователя');
        }
    }

    async login(username: string, password: string, userAgent: string, ip: string) {
        try {
            this.logger.log('Бэкенд начал обработку запроса на вход:', username, password);

            const user = await this.userRepository.findOne({ where: { username } });

            this.logger.log('Получен пользователь из бд', user);
            if (!user) {
                throw new Error('Пользователь не найден');
            }

            // Проверяем пароль
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Неверный пароль');
            }

            //Создаем сессию
            const session = await this.sessionService.createSession(
                user.id,
                userAgent,
                ip
            );
            this.logger.log('Создана ссесия', session);

            //Генерируем JWT токен
            const token = this.jwtService.sign(
                { userId: user.id },
                { expiresIn: '7d' }
            );
            this.logger.log('Создан токен', token);

            // Возвращаем пользователя без пароля
            const { password: _, ...userWithoutPassword } = user;
            return {
                user: userWithoutPassword,
                token: token,
                session: session.id,
                message: 'Успешный вход пользователя'
            }
        } catch (error) {
            this.logger.error('Ошибка при входе пользователя', error.stack);
            throw new Error('Не удалось выполнить вход');
        }
    }

    async refreshUserData(userId: string, data: any) {
        this.logger.log(`Обновление данных пользователя с ID ${userId}`, data);
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error(`Пользователь с ID ${userId} не найден`);
            }

            // TODO: Добавить логику обновления токена (опционально)

            return await this.userRepository.save(user);
        } catch (error) {
            this.logger.error(`Ошибка при обновлении данных пользователя с ID ${userId}`, error.stack);
            throw new Error('Не удалось обновить данные пользователя');
        }
    }

    async checkSession(token: string) {
        this.logger.log('Проверка сессии с токеном:', token);
        try {
            const session = await this.sessionService.findSession(token);

            if (!session) {
                throw new Error(`Сессия с токеном ${token} не найдена`);
            }

            const user = await this.userRepository.findOne({ where: { id: session.userId } });

            if (!user) {
                throw new Error(`Не найден пользователь с токеном ${token}`);
            }

            return user;
        } catch (erorr) {
            this.logger.error(`Ошибка при проверки сессии с токеном: ${token}`, erorr.stack);
            throw new Error('Не удалось проверить сессию');
        }
    }

    async logout(token: string) {
        this.logger.log('Принят запрос на logout с токеном:', token);
        try {
            const session = await this.sessionService.deleteSession(token);
            this.logger.log('Сессия успешно удалена', session);
            return;
        } catch (error) {
            this.logger.error('Произошла ошибка при попытке выхода:', error.stack);
            throw new Error('Ошбика при выходе');
        }
    }

}
