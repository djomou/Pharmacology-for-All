import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('commonnamegroup_indication')
export class CommonNameGroupIndication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'commonNameGroupId', type: 'int', nullable: true })
  commonNameGroupId: number;

  @Column({ name: 'indicationId', type: 'int', nullable: true })
  indicationId: number;
}
