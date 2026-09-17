import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum NotifType {
  ALERT       = 'alert',
  INTERACTION = 'interaction',
  RAPPEL      = 'rappel',
  INFO        = 'info',
  SYSTEM      = 'system',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) userId: number;
  @Column() title: string;
  @Column({ type: 'text' }) message: string;

  @Column({ type: 'enum', enum: NotifType, default: NotifType.INFO })
  type: NotifType;

  @Column({ default: false }) isRead: boolean;
  @Column({ nullable: true }) link: string;

  @CreateDateColumn()
  createdAt: Date;
}
