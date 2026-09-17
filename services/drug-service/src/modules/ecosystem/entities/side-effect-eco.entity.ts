import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('sideEffect')
export class SideEffectEco {
  @PrimaryColumn({ name: 'sideEffectId' }) sideEffectId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) apparatusId: number;
}
