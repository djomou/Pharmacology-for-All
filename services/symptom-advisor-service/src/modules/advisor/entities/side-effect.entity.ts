import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('sideEffect')
export class SideEffect {
  @PrimaryColumn({ name: 'sideEffectId' }) sideEffectId: number;
  @Column({ nullable: true }) name: string;
}
