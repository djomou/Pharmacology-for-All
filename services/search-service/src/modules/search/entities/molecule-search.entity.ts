import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('molecule')
export class MoleculeSearch {
  @PrimaryColumn({ name: 'moleculeId' }) moleculeId: number;
  @Column({ nullable: true }) name: string;
}
