import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('molecule')
export class Molecule {
  @PrimaryColumn({ name: 'moleculeId' })
  moleculeId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  basemoleculeId: number;

  @Column({ nullable: true })
  homeopathy: number;

  @Column({ nullable: true })
  allergenicMoleculeId: number;

  @Column({ nullable: true })
  allergyAlert: number;

  @Column({ nullable: true })
  role: number;

  @Column({ nullable: true })
  useInComposition: number;

  @Column({ nullable: true })
  pharmacologypropertyId: number;

  @Column({ type: 'text', nullable: true })
  pharmacologypropertycomment: string;
}
