import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Acronym {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  acronym: string;

  @Column()
  definition: string;
}

@Entity()
export class AcronymStatus {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column()
  seedDataLoaded: boolean;
}
