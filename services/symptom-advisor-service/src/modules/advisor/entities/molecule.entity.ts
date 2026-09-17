import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('molecule')
export class Molecule {
  @PrimaryColumn({ name: 'moleculeId' }) moleculeId: number;
  @Column({ nullable: true }) name: string;
}
