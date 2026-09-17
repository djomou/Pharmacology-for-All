import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryColumn({ name: 'productId' })
  productId: number;

  @Column({ nullable: true })
  cis: string;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'shortName', nullable: true })
  shortName: string;

  @Column({ name: 'commercial_name', nullable: true })
  commercialName: string;

  @Column({ nullable: true })
  marketStatus: number;

  @Column({ nullable: true })
  productRangeId: number;

  @Column({ nullable: true })
  commonNameGroupId: number;

  @Column({ nullable: true })
  formId: number;

  @Column({ nullable: true })
  companyId: number;

  @Column({ nullable: true })
  type: number;

  @Column({ nullable: true })
  genericType: string;

  @Column({ nullable: true })
  drugInSport: number;

  @Column({ nullable: true })
  midwife: number;

  @Column({ nullable: true })
  ald: number;
}
