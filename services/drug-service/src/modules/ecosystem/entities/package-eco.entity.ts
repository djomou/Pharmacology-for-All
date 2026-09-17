import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('package')
export class PackageEco {
  @PrimaryColumn({ name: 'packageId' }) packageId: number;
  @Column({ nullable: true }) productId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) shortName: string;
  @Column({ nullable: true }) marketStatus: number;
  @Column({ nullable: true }) cip: string;
  @Column({ nullable: true }) cip13: string;
  @Column({ nullable: true }) publicPrice: string;
  @Column({ nullable: true }) refundingRate: string;
}
