import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_indication')
export class ProductIndication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'productId', type: 'int', nullable: true })
  productId: number;

  @Column({ name: 'indicationId', type: 'int', nullable: true })
  indicationId: number;
}
