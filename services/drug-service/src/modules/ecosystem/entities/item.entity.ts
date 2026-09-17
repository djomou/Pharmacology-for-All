import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('item')
export class Item {
  @PrimaryColumn({ name: 'itemId' }) itemId: number;
  @Column({ nullable: true }) productId: number;
  @Column({ nullable: true }) name: string;
}
