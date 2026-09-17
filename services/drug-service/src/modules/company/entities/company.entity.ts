import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('company')
export class Company {
  @PrimaryColumn({ name: 'companyId' })
  companyId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  shortName: string;

  @Column({ nullable: true })
  countryCode: string;
}
