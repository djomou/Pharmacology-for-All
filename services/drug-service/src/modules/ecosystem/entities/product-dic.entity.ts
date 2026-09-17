import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('product_drugInteractionClass')
export class ProductDrugInteractionClass {
  @PrimaryColumn({ name: 'productId' }) productId: number;
  @PrimaryColumn({ name: 'drugInteractionClassId' }) drugInteractionClassId: number;
}
