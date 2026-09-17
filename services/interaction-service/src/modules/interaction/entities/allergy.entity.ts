import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('allergy')
export class Allergy {
  @PrimaryColumn({ name: 'allergyId' })
  allergyId: number;

  @Column({ nullable: true })
  name: string;
}
