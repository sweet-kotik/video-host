import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsEmail } from 'class-validator';
import { IsFile } from 'nestjs-form-data';

export default class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsEmail()
    email: string;

    @IsFile()
    @IsOptional()
    file: Express.Multer.File;
}