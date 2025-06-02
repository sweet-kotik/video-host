import { Injectable, Logger } from '@nestjs/common';
import { Video } from './video.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVideoDto } from './dto/video.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as ffmpeg from 'fluent-ffmpeg';
import * as Minio from 'minio';
import {
    VideoNotFoundException,
    VideoProcessingException,
    VideoStorageException
} from '../common/exceptions/video.exceptions';

@Injectable()
export class VideoService {
    private readonly logger = new Logger(VideoService.name);




    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>
    ) { }

    async findAll() {
        try {
            const minioClient = new Minio.Client({
                endPoint: process.env.MINIO_ENDPOINT || 'localhost',
                port: parseInt(process.env.MINIO_PORT || '9000'),
                useSSL: process.env.MINIO_USE_SSL === 'true',
                accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
                secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
            });

            const bucketPolicy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": [
                            "s3:GetObject",
                            "s3:GetBucketLocation"
                        ],
                        Principal: {
                            AWS: ['*']
                        },
                        "Resource": [
                            "arn:aws:s3:::*"
                        ]
                    }
                ]
            };

            await minioClient.setBucketPolicy('videos', JSON.stringify(bucketPolicy));

            return await this.videoRepository.find();
        } catch (error) {
            this.logger.error('Ошибка при получении списка видео', error.stack);
            throw new VideoStorageException('Не удалось получить список видео');
        }
    }

    async findOne(id: string) {
        try {
            const video = await this.videoRepository.findOne({ where: { id } });
            if (!video) {
                throw new VideoNotFoundException(id);
            }
            return video;
        } catch (error) {
            if (error instanceof VideoNotFoundException) {
                throw error;
            }
            this.logger.error(`Ошибка при получении видео с ID ${id}`, error.stack);
            throw new VideoStorageException('Не удалось получить видео');
        }
    }

    async create(data: CreateVideoDto, user: string) {
        const { file, title, description } = data;
        const generatedFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        let tempDir: string = '';
        let video: Video | undefined;

        this.logger.log('Полученные данные от видео:', title);


        try {
            video = new Video();
            video.title = title;
            video.description = description;
            video.createdAt = new Date().toISOString();
            video.status = "pending";
            video.tags = ['test'];
            video.user = user;
            video.category = "other";
            video.isPrivate = false;
            video.views = 0;
            video.likes = 0;
            video.dislikes = 0;

            await this.videoRepository.save(video);

            this.logger.log(`${video.title} - первичная загрузка успешна`);
            this.logger.log(`${video.title} - установлен статус: pending`)


            // Создаем временные директории для обработки
            tempDir = path.join(os.tmpdir(), generatedFilename);
            const videoDir = path.join(tempDir, 'video');
            const thumbnailsDir = path.join(tempDir, 'thumbnails');

            await fs.promises.mkdir(tempDir, { recursive: true });
            await fs.promises.mkdir(videoDir, { recursive: true });
            await fs.promises.mkdir(thumbnailsDir, { recursive: true });

            // Сохраняем загруженный файл
            const videoPath = path.join(videoDir, 'original.mp4');
            await fs.promises.writeFile(videoPath, file.buffer);

            this.logger.log(`${video.title} - начата генерация превью`);
            // Генерируем превью
            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .screenshots({
                        count: 5,
                        folder: thumbnailsDir,
                        filename: 'thumbnail-%i.jpg',
                        //size: '320x240'
                    })
                    .on('end', resolve)
                    .on('error', (err: any) => {
                        this.logger.error('Ошибка при генерации превью', err);
                        reject(new VideoProcessingException('Ошибка при генерации превью'));
                    });
            });
            this.logger.log(`${video.title} - превью успешно сгенерировано`);

            this.logger.log(`${video.title} - начата конвертация в HLS`);
            // Конвертируем в HLS с разными качествами
            const qualities = ['360p', '480p', '720p', '1080'];
            const ffmpegCommands = qualities.map(quality => {
                const height = quality.replace('p', '');
                return ffmpeg(videoPath)
                    .outputOptions([
                        `-vf scale=-2:${height}`,
                        '-c:v libx264',
                        '-c:a aac',
                        '-b:a 128k',
                        '-hls_time 10',
                        '-hls_list_size 0',
                        '-f hls'
                    ])
                    .output(path.join(videoDir, `${quality}.m3u8`));
            });
            this.logger.log(`${video.title} - конвернтация прошла успешно`);

            // Создаем основной плейлист
            const masterPlaylist = `#EXTM3U
                #EXT-X-VERSION:3
                ${qualities.map(quality => `#EXT-X-STREAM-INF:BANDWIDTH=${quality === '360p' ? '800000' : quality === '480p' ? '1400000' : quality === '720p' ? '2800000' : '5000000'},RESOLUTION=${quality === '360p' ? '640x360' : quality === '480p' ? '854x480' : quality === '720p' ? '1280x720' : '1920x1080'}
                ${quality}.m3u8`).join('\n')}`;

            await fs.promises.writeFile(path.join(videoDir, 'master.m3u8'), masterPlaylist);

            await Promise.all(ffmpegCommands.map(cmd => new Promise((resolve, reject) => {
                cmd.on('end', resolve).on('error', (err: any) => {
                    this.logger.error('Ошибка при конвертации видео', err);
                    reject(new VideoProcessingException('Ошибка при конвертации видео'));
                }).run();
            })));


            this.logger.log('Подключаюсь к MinIO');
            // Загружаем в MinIO
            const minioClient = new Minio.Client({
                endPoint: process.env.MINIO_ENDPOINT || 'localhost',
                port: parseInt(process.env.MINIO_PORT || '9000'),
                useSSL: process.env.MINIO_USE_SSL === 'true',
                accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
                secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
            });
            this.logger.log('Подключение успешно');

            this.logger.log('Начинаю загружать видео файлы');
            // Загружаем видео файлы
            const videoFiles = await fs.promises.readdir(videoDir);
            for (const file of videoFiles) {
                const filePath = path.join(videoDir, file);
                const fileContent = await fs.promises.readFile(filePath);
                await minioClient.putObject(
                    process.env.MINIO_BUCKET || 'videos',
                    `videos/${generatedFilename}/video/${file}`,
                    fileContent
                );
            }
            this.logger.log('Видео файлы загружены успешно');

            this.logger.log('Начинаю загружать превью');
            // Загружаем превью
            const thumbnailFiles = await fs.promises.readdir(thumbnailsDir);
            for (const file of thumbnailFiles) {
                const filePath = path.join(thumbnailsDir, file);
                const fileContent = await fs.promises.readFile(filePath);
                await minioClient.putObject(
                    process.env.MINIO_BUCKET || 'videos',
                    `videos/${generatedFilename}/thumbnails/${file}`,
                    fileContent
                );
            }
            this.logger.log('Привеью успешно загружено');

            // Создаем запись в БД
            video.videoPath = generatedFilename;
            video.thumbnailPath = generatedFilename;
            video.status = "approved";
            await this.videoRepository.save(video);

            this.logger.log(`${video.title} - обработано и загружено успешно, установлен статус: approved`)

            return video;

        } catch (error) {
            this.logger.error('Ошибка при создании видео', error.stack);

            // Обновляем статус на rejected в случае ошибки
            if (video) {
                video.status = "rejected";
                await this.videoRepository.save(video);
            }

            if (error instanceof VideoProcessingException) {
                throw error;
            }

            throw new VideoStorageException('Не удалось создать видео');
        } finally {
            // Очищаем временные файлы
            if (tempDir) {
                try {
                    await fs.promises.rm(tempDir, { recursive: true, force: true });
                } catch (error) {
                    this.logger.error('Ошибка при удалении временных файлов', error.stack);
                }
            }
        }
    }

    async save(video: Video) {
        return this.videoRepository.save(video);
    }

    async delete(id: string) {
        try {
            const video = await this.videoRepository.findOne({ where: { id } });
            if (!video) {
                throw new VideoNotFoundException(id);
            }

            // Удаляем видео из MinIO
            const minioClient = new Minio.Client({
                endPoint: process.env.MINIO_ENDPOINT || 'localhost',
                port: parseInt(process.env.MINIO_PORT || '9000'),
                useSSL: process.env.MINIO_USE_SSL === 'true',
                accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
                secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
            });

            await minioClient.removeObject(
                process.env.MINIO_BUCKET || 'videos',
                `videos/${video.videoPath}/video/master.m3u8`
            );

            // Удаляем запись из БД
            await this.videoRepository.remove(video);

            return { message: `Видео с ID ${id} успешно удалено` };
        } catch (error) {
            this.logger.error(`Ошибка при удалении видео с ID ${id}`, error.stack);
            throw new VideoStorageException('Не удалось удалить видео');
        }
    }
}
