import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('indication')
export class Indication {
  @PrimaryColumn({ name: 'indicationId' }) indicationId: number;
  @Column({ nullable: true }) name: string;
}
