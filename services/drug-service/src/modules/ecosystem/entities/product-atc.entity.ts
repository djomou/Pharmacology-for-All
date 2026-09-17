import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('product_atc')
export class ProductAtc {
  @PrimaryColumn({ name: 'productId' }) productId: number;
  @PrimaryColumn({ name: 'atcClassId' }) atcClassId: number;
}
