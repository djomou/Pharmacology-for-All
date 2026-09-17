import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('drug_crud_metadata')
export class DrugMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  productId: number;

  @Column({ type: 'text', nullable: true }) activePrinciples: string;
  @Column({ type: 'text', nullable: true }) excipients: string;
  @Column({ type: 'text', nullable: true }) interactions: string;
  @Column({ type: 'text', nullable: true }) foodInteractions: string;
  @Column({ type: 'text', nullable: true }) posology: string;
  @Column({ type: 'text', nullable: true }) indications: string;
  @Column({ type: 'text', nullable: true }) cim10: string;
  @Column({ type: 'text', nullable: true }) sideEffects: string;
  @Column({ type: 'text', nullable: true }) allergies: string;
  @Column({ type: 'text', nullable: true }) warnings: string;
  @Column({ type: 'text', nullable: true }) precautions: string;
  @Column({ type: 'text', nullable: true }) atcClassification: string;
  @Column({ type: 'text', nullable: true }) contraindications: string;
  @Column({ type: 'text', nullable: true }) notes: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
