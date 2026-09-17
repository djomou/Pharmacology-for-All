import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('warning')
export class WarningEco {
  @PrimaryColumn({ name: 'warningId' }) warningId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) comment: string;
}
