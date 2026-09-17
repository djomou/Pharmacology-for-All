import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('allergy_molecule')
export class AllergyMolecule {
  @PrimaryColumn({ name: 'allergyId' }) allergyId: number;
  @PrimaryColumn({ name: 'moleculeId' }) moleculeId: number;
}
