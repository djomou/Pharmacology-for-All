import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('commonnamegroup_warning')
export class CommonnameGroupWarning {
  @PrimaryColumn({ name: 'commonNameGroupId' }) commonNameGroupId: number;
  @PrimaryColumn({ name: 'warningId' }) warningId: number;
}
