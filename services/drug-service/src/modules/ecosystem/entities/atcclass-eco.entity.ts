import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('atcClass')
export class AtcClassEco {
  @PrimaryColumn({ name: 'atcClassId' }) atcClassId: number;
  @Column({ nullable: true }) code: string;
  @Column({ nullable: true }) name: string;
  @Column({ name: 'parentId', nullable: true }) parentId: number;
}
