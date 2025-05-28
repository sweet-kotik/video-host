import { HttpException, HttpStatus } from '@nestjs/common';

export class VideoNotFoundException extends HttpException {
    constructor(id: string) {
        super(`Видео с ID ${id} не найдено`, HttpStatus.NOT_FOUND);
    }
}

export class VideoProcessingException extends HttpException {
    constructor(message: string) {
        super(`Ошибка обработки видео: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class VideoUploadException extends HttpException {
    constructor(message: string) {
        super(`Ошибка загрузки видео: ${message}`, HttpStatus.BAD_REQUEST);
    }
}

export class VideoStorageException extends HttpException {
    constructor(message: string) {
        super(`Ошибка хранения видео: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 