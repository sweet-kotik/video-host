import { IsFile, HasMimeType } from 'nestjs-form-data';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateVideoDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    title: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description: string;

    @IsFile()
    @HasMimeType(['video/mp4', 'video/x-msvideo'])
    file: Express.Multer.File;
}