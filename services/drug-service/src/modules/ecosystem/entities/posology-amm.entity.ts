import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('posologyAmm')
export class PosologyAmm {
  @PrimaryColumn({ name: 'posologyAmmId' }) posologyAmmId: number;
  @Column({ nullable: true }) productId: number;
  @Column({ nullable: true }) dest_ad: number;
  @Column({ nullable: true }) dest_ge: number;
  @Column({ nullable: true }) dest_je: number;
  @Column({ nullable: true }) dest_no: number;
  @Column({ nullable: true }) posoFixe: string;
  @Column({ nullable: true }) dosage: string;
  @Column({ nullable: true }) posoMoy: string;
  @Column({ nullable: true }) posoMax: string;
  @Column({ nullable: true }) freqAd: string;
  @Column({ nullable: true }) freqType: string;
  @Column({ nullable: true }) durAd: string;
  @Column({ nullable: true }) durType: string;
  @Column({ nullable: true }) ageMin: number;
  @Column({ nullable: true }) ageMax: number;
  @Column({ nullable: true }) uniDos: string;
}
