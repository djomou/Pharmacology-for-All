import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('indication')
export class IndicationEco {
  @PrimaryColumn({ name: 'indicationId' }) indicationId: number;
  @Column({ nullable: true }) name: string;
}
