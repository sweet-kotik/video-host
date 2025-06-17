import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Video {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ default: 0 })
    likes: number;

    @Column({ default: 0 })
    dislikes: number;

    @Column({ nullable: true })
    comments: string[];

    @Column({ nullable: true })
    user: string;

    @CreateDateColumn()
    createdAt: string;

    @Column({ nullable: true })
    videoPath: string;

    @Column({ nullable: true })
    thumbnailPath: string;

    @Column({ nullable: true })
    views: number;

    @Column('simple-array', { nullable: true, default: [] })
    tags: string[];

    @Column({ nullable: true })
    category: string;

    @Column({ enum: [true, false], default: false })
    isPrivate: boolean;

    @Column({ enum: ["pending", "approved", "rejected"], default: "pending" })
    status: string;
}