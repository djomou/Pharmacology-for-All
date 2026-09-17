import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('drugInteractionClass')
export class DrugInteractionClassEco {
  @PrimaryColumn({ name: 'drugInteractionClassId' }) drugInteractionClassId: number;
  @Column({ nullable: true }) name: string;
}
