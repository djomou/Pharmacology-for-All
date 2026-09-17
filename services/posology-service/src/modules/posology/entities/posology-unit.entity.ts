import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('posologyUnit')
export class PosologyUnit {
  @PrimaryColumn({ name: 'posologyUnitId' })
  posologyUnitId: number;

  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) shortName: string;
  @Column({ nullable: true }) unitCategoryId: number;
}
