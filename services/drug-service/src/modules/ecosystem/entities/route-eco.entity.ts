import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('route')
export class RouteEco {
  @PrimaryColumn({ name: 'routeId' }) routeId: number;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) shortName: string;
}
