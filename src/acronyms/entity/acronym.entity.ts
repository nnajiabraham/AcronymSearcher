import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Definition } from './definition.entity';

@Entity()
export class Acronym {
  @PrimaryGeneratedColumn('uuid')
  acronymId: string;

  @Column()
  @Index()
  acronym: string;

  @OneToMany(
    () => Definition,
    definition => definition.acronym,
    {
      cascade: ['insert', 'update'],
    },
  )
  definitions: Definition[];
}

@Entity()
export class AcronymDBState {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column()
  hasPreLoadedAcronym: boolean;
}
