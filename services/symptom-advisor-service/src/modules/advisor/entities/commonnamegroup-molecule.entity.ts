import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('commonnamegroup_composition')
export class CommonNameGroupComposition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'commonNameGroupId', type: 'int', nullable: true })
  commonNameGroupId: number;

  @Column({ name: 'moleculeId', type: 'int', nullable: true })
  moleculeId: number;
}
