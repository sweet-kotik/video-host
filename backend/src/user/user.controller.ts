import { Controller, Get, Post, Query, Delete, Body, Param, UseInterceptors, UploadedFile, Req, Res, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { FileInterceptor } from '@nestjs/platform-express';
import CreateUserDto from './dto/user.dto';
import { Request } from 'express';
import { Response } from 'express';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) { }
  private readonly logger = new Logger(UserController.name);

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('/findOne')
  async findOne(@Query('id') id: string): Promise<User> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Неверный формат UUID');
    }
    return this.userService.findOne(id);
  }

  @Post('/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    this.logger.log('Запрос на вход получен', email, password);
    this.logger.log('Headers:', request.headers);
    this.logger.log('Cookies:', request.cookies);

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const userAgent = request.headers['user-agent'] || 'unknown';
    const ip = request.ip;

    const result = await this.userService.login(email, password, userAgent as string, ip as string);

    this.logger.log('Устанавливаем куки с токеном:', result.token);

    response.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day
    })

    this.logger.log('Куки установлены');
    this.logger.log('Проверка установленных куки:', response.getHeader('Set-Cookie'));

    return {
      user: result.user,
      message: 'Успешный вход!'
    }
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('/create')
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const userAgent = request.headers['user-agent'] || 'unknown';
    const ip = request.ip;

    const data = {
      ...createUserDto,
      file
    };

    const result = await this.userService.create(data, userAgent as string, ip as string);

    response.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    })

    return {
      user: result.user,
      message: 'Пользователь успешно создан'
    }
  }

  @Get('/checkSession')
  async checkSession(
    @Req() request: Request,
  ) {
    try {
      this.logger.log('Получен запрос на проверку сессии');
      this.logger.log('Все куки:', request.cookies);
      this.logger.log('Заголовки запроса:', request.headers);

      const token = request.cookies['auth_token'];

      this.logger.log('Найденный токен:', token);

      if (!token) {
        this.logger.warn('Токен не найден в куках');
        return {
          error: 'Требуется авторизация',
          isAuthenticated: false
        };
      }

      const user = await this.userService.checkSession(token);
      return {
        ...user,
        isAuthenticated: true
      };
    } catch (error) {
      this.logger.error('Ошибка при проверке сессии:', error.stack);
      return {
        error: 'Ошибка при проверке сессии',
        isAuthenticated: false
      }
    }
  }

  @Post('/logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    this.logger.log('Cookies:', request.cookies);
    const token = request.cookies['auth_token'];
    this.logger.log('Auth token:', token);

    if (!token) {
      throw new Error('Токен не найден в объекте запроса');
    }

    await this.userService.logout(token);

    response.clearCookie('auth_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });


    return {
      message: 'Успешный выход из системы'
    };
  }
}
