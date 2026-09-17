import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('allergy')
export class AllergyEco {
  @PrimaryColumn({ name: 'allergyId' }) allergyId: number;
  @Column({ nullable: true }) name: string;
}
