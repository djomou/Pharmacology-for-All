import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('patient_favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() userId: number;
  @Column() productId: number;
  @Column({ nullable: true }) productName: string;
  @Column({ nullable: true }) note: string;

  @CreateDateColumn()
  addedAt: Date;
}
