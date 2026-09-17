import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('posology')
export class Posology {
  @PrimaryColumn({ name: 'posologyId' })
  posologyId: number;

  @Column({ nullable: true }) posologyAmmId: number;
  @Column({ nullable: true }) posologyPhaseId: number;
  @Column({ nullable: true }) posologyUnitId: number;
  @Column({ nullable: true }) minDose: number;
  @Column({ nullable: true }) maxDose: number;
  @Column({ nullable: true }) type: number;
}
