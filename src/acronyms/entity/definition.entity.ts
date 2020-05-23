import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Acronym } from './acronym.entity';

@Entity()
export class Definition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  definition: string;

  @ManyToOne(
    () => Acronym,
    acronym => acronym.id,
  )
  acronym: Acronym;
}
