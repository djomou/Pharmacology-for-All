import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() userId: number;
  @Column({ nullable: true }) productId: number;
  @Column({ nullable: true }) productName: string;
  @Column({ nullable: true }) dosage: string;
  @Column({ nullable: true }) frequency: string;
  @Column({ nullable: true }) startDate: string;
  @Column({ nullable: true }) endDate: string;
  @Column({ nullable: true }) prescribedBy: string;
  @Column({ default: true })  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
