import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('product')
export class ProductRef {
  @PrimaryColumn({ name: 'productId' })
  productId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'shortName', nullable: true })
  shortName: string;
}
