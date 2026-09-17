import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('indication')
export class IndicationSearch {
  @PrimaryColumn({ name: 'indicationId' }) indicationId: number;
  @Column({ nullable: true }) name: string;
}
