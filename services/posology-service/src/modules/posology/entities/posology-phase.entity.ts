import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('posologyPhase')
export class PosologyPhase {
  @PrimaryColumn({ name: 'posologyPhaseId' })
  posologyPhaseId: number;

  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) shortName: string;
}
