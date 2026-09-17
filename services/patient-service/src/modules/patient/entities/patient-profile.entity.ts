import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('patient_profiles')
export class PatientProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column({ nullable: true }) dateOfBirth: string;
  @Column({ nullable: true }) gender: string;
  @Column({ nullable: true }) weight: number;
  @Column({ nullable: true }) height: number;
  @Column({ type: 'text', nullable: true }) allergies: string;
  @Column({ type: 'text', nullable: true }) chronicConditions: string;

  @CreateDateColumn()
  createdAt: Date;
}
