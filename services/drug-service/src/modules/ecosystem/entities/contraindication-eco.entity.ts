import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('contraindication')
export class ContraindicationEco {
  @PrimaryColumn({ name: 'contraIndicationId' }) contraIndicationId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) comment: string;
}
