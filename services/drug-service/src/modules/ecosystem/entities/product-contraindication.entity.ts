import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('commonnamegroup_contraindication')
export class ProductContraindication {
  @PrimaryColumn({ name: 'commonNameGroupId' }) commonNameGroupId: number;
  @PrimaryColumn({ name: 'contraIndicationId' }) contraIndicationId: number;
}
