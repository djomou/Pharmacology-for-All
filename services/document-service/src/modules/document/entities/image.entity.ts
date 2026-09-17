import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('image')
export class Image {
  @PrimaryColumn({ name: 'imageId' }) imageId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) url: string;
  @Column({ nullable: true }) type: number;
}
