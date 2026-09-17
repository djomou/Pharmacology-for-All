import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('molecule')
export class MoleculeEco {
  @PrimaryColumn({ name: 'moleculeId' }) moleculeId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) allergyAlert: number;
  @Column({ nullable: true }) useInComposition: number;
  @Column({ nullable: true }) role: number;
}
