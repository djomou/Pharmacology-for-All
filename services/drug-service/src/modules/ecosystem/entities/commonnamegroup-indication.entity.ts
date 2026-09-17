import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('commonnamegroup_indication')
export class CommonnameGroupIndication {
  @PrimaryColumn({ name: 'commonNameGroupId' }) commonNameGroupId: number;
  @PrimaryColumn({ name: 'indicationId' }) indicationId: number;
}
