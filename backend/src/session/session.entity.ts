import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "src/user/user.entity";

@Entity()
export default class Session {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    token: string;

    @Column()
    userId: string;

    @ManyToOne(() => User)
    user: User;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    ip: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    expiresAt: Date;
}