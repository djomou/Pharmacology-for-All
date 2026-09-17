import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('drugInteractionClass')
export class DrugInteractionClass {
  @PrimaryColumn({ name: 'drugInteractionClassId' })
  drugInteractionClassId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
