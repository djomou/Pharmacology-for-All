import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('contraindication')
export class Contraindication {
  @PrimaryColumn({ name: 'contraIndicationId' })
  contraIndicationId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  comment: string;
}
