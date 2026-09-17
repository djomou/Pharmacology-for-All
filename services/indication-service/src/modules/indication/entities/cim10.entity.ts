import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('cim10')
export class Cim10 {
  @PrimaryColumn({ name: 'cim10Id' })
  cim10Id: number;

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ nullable: true })
  type: number;
}
