import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('document')
export class Document {
  @PrimaryColumn({ name: 'documentId' }) documentId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) type: number;
  @Column({ nullable: true }) url: string;
  @Column({ nullable: true }) productId: number;
  @Column({ nullable: true }) date: string;
}
