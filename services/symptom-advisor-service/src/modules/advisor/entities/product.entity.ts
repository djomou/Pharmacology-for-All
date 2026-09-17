import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryColumn({ name: 'productId' }) productId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) shortName: string;
  @Column({ name: 'commercial_name', nullable: true }) commercialName: string;
  @Column({ nullable: true }) marketStatus: number;
  @Column({ nullable: true }) formId: number;
}
