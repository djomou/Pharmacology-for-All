import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('product_route')
export class ProductRoute {
  @PrimaryColumn({ name: 'productId' }) productId: number;
  @PrimaryColumn({ name: 'routeId' }) routeId: number;
}
