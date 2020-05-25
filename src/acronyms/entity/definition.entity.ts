import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Acronym } from './acronym.entity';

@Entity()
export class Definition {
  @PrimaryGeneratedColumn('uuid')
  definitionId: string;

  @Column()
  definition: string;

  @ManyToOne(
    () => Acronym,
    acronym => acronym.acronymId,
    {
      onDelete: 'CASCADE',
    },
  )
  acronym: Acronym;
}
