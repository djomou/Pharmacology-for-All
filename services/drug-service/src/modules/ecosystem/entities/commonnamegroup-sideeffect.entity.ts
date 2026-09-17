import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('commonnamegroup_sideEffect')
export class CommonnameGroupSideEffect {
  @PrimaryColumn({ name: 'commonNameGroupId' }) commonNameGroupId: number;
  @PrimaryColumn({ name: 'sideEffectId' }) sideEffectId: number;
}
