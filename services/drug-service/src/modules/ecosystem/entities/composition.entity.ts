import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('composition')
export class Composition {
  @PrimaryColumn({ name: 'compositionId' }) compositionId: number;
  @Column({ nullable: true }) itemId: number;
  @Column({ nullable: true }) moleculeId: number;
  @Column({ nullable: true }) perVolume: string;
  @Column({ nullable: true }) perVolumeUnitId: number;
  @Column({ nullable: true }) nature: string;
  @Column({ nullable: true }) rank: number;
}
