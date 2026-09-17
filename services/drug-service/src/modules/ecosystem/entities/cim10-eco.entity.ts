import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('cim10')
export class Cim10Eco {
  @PrimaryColumn({ name: 'cim10Id' }) cim10Id: number;
  @Column({ nullable: true }) code: string;
  @Column({ nullable: true }) name: string;
}
