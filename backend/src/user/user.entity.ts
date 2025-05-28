import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { IsEmail, IsString, IsOptional } from 'class-validator';

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @IsEmail()
    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    username: string;

    @CreateDateColumn()
    createdAt: string;

    @Column({ nullable: true })
    profilePicture: string;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ default: false })
    isAdmin: boolean;

    @Column({ default: false })
    isBanned: boolean;

    @Column({ default: 0 })
    videoCount: number;

    @Column('simple-array', { nullable: true, default: [] })
    uploadedVideos: string[];

    @Column({ default: 0 })
    subscriberCount: number;

    @Column({ default: 0 })
    viewCount: number;

    @Column('simple-array', { nullable: true, default: [] })
    subscriptions: string[];

    @Column('simple-array', { nullable: true, default: [] })
    likedVideos: string[];

    @Column('simple-array', { nullable: true, default: [] })
    dislikedVideos: string[];

    @Column('simple-array', { nullable: true, default: [] })
    history: string[];

    @Column('simple-array', { nullable: true, default: [] })
    playlists: string[];

    @Column('simple-array', { nullable: true, default: [] })
    comments: string[];
}