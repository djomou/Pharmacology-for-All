import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('product')
export class ProductSearch {
  @PrimaryColumn({ name: 'productId' })
  productId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'shortName', nullable: true })
  shortName: string;

  @Column({ name: 'commercial_name', nullable: true })
  commercialName: string;

  @Column({ nullable: true })
  marketStatus: number;
}
