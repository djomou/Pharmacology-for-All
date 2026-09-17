import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('country')
export class Country {
  @PrimaryColumn({ name: 'countryId' })
  countryId: number;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  regionId: number;

  @Column({ nullable: true })
  enabled: number;
}
