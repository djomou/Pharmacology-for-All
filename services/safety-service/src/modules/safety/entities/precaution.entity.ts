import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('precaution')
export class Precaution {
  @PrimaryColumn({ name: 'precautionId' })
  precautionId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  comment: string;
}
