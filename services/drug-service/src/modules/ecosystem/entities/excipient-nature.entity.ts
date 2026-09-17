import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('excipientNature')
export class ExcipientNature {
  @PrimaryColumn({ name: 'excipientNatureId' }) excipientNatureId: number;
  @Column({ nullable: true }) name: string;
}
