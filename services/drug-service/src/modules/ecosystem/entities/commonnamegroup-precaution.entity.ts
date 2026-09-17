import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('commonnamegroup_precaution')
export class CommonnameGroupPrecaution {
  @PrimaryColumn({ name: 'commonNameGroupId' }) commonNameGroupId: number;
  @PrimaryColumn({ name: 'precautionId' }) precautionId: number;
}
