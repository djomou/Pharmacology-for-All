import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('atcClass')
export class AtcClass {
  @PrimaryColumn({ name: 'atcClassId' })
  atcClassId: number;

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  code: string;
}
