import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_molecule')
export class ProductMolecule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'productId', type: 'int', nullable: true })
  productId: number;

  @Column({ name: 'moleculeId', type: 'int', nullable: true })
  moleculeId: number;
}
