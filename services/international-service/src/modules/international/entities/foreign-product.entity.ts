import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('foreignproduct')
export class ForeignProduct {
  @PrimaryColumn({ name: 'foreignProductId' })
  foreignProductId: number;

  @Column({ nullable: true })
  naturalId: number;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  atcClassId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  localName: string;

  @Column({ nullable: true })
  stformId: number;
}
