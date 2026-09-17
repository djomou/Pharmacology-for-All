import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('reco')
export class Reco {
  @PrimaryColumn({ name: 'recoId' }) recoId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) url: string;
  @Column({ nullable: true }) type: number;
  @Column({ nullable: true }) date: string;
}
