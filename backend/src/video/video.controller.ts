import { Controller, Get, Post, Delete, Query, Body, Param, UseInterceptors, BadRequestException } from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/video.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { VideoUploadException } from '../common/exceptions/video.exceptions';
import { User } from 'src/user/user.entity';

@Controller('api/videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) { }

  @Get()
  async findAll() {
    return this.videoService.findAll();
  }

  @Get('/findOne')
  async findOne(@Query('id') id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    console.log('[file: video.controller.ts] Video id:' + id);
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Неверный формат UUID');
    }
    return this.videoService.findOne(id);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('/upload')
  async create(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('user') user: User,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new VideoUploadException('Файл не был загружен');
    }

    if (file.size > 1024 * 1024 * 1024) { // 1GB limit
      throw new VideoUploadException('Размер файла превышает 1GB');
    }

    console.group('Upload Data');
    console.log('/api/videos/upload title: ', title);
    console.log('/api/videos/upload description: ', description);
    console.log('/api/videos/upload file: ', file.filename);
    console.groupEnd();

    const createVideoDto: CreateVideoDto = {
      title,
      description,
      file
    };

    return await this.videoService.create(createVideoDto, user);
  }
}
