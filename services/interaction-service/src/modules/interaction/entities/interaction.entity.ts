import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('interaction')
export class Interaction {
  @PrimaryColumn({ name: 'interactionId' })
  interactionId: number;

  @PrimaryColumn({ name: 'drugInteractionClassId1' })
  drugInteractionClassId1: number;

  @PrimaryColumn({ name: 'drugInteractionClassId2' })
  drugInteractionClassId2: number;

  @Column({ type: 'text', nullable: true })
  riskComment: string;

  @Column({ type: 'text', nullable: true })
  precautionComment: string;

  @Column({ nullable: true })
  severity: number;
}
