import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Like, Repository } from 'typeorm';
import { Acronym, AcronymDBState } from './entity/acronym.entity';
import { Definition } from './entity/definition.entity';

@Injectable()
export class AcronymService {
  constructor(
    @InjectRepository(Acronym) private acronymRepository: Repository<Acronym>,
    @InjectRepository(AcronymDBState)
    private acronymDBStateRepository: Repository<AcronymDBState>,
  ) {}

  //TODO The relationship for one acronym is to many definitions, need to handle that in the db
  async createAcronym(acronym: Acronym): Promise<Acronym> {
    const newAcronym = await this.acronymRepository.save(acronym);
    return newAcronym;
  }

  async getAcronymDefinition(acronym: string) {
    const result = await this.acronymRepository.find({
      where: { acronym: Like(acronym) },
      relations: ['definitions'],
    });
    return result;
  }

  async searchAcronym(acronym: string, offset: number = 0, limit: number = 10) {
    const result = await this.acronymRepository.findAndCount({
      where: { acronym: Like(`%${acronym}%`) },
      relations: ['definitions'],
      take: limit > 10 ? 10 : limit,
      skip: offset,
    });
    return result;
  }

  async getRandomRecords(count: number) {
    const result: Acronym[] = await this.acronymRepository
      .createQueryBuilder()
      .select('*')
      .from<Acronym>(Acronym, 'a')
      .orderBy('Random()')
      .limit(count)
      .execute();

    return result;
  }

  async updateAcronym(acronym: string, update: Acronym) {
    //TODO after changing db structure to one to many have to handle updating
    const entity = await this.acronymRepository.findOne({
      where: { acronym: Like(acronym) },
      relations: ['definitions'],
    });

    if (!entity) {
      console.error('Error updating acronym, Acronym not found ');
      throw new NotFoundException('Acronym not found');
    }

    try {
      update.id = entity.id;
      const result = await this.acronymRepository.save(update);
      return result;
    } catch (err) {
      console.error('Error occurred updating record', err);
      throw new InternalServerErrorException('Error occurred updating record');
    }
  }

  async bootStrapDBWithInitialData() {
    const status = await this.acronymDBStateRepository.findOne({
      where: { id: '1' },
    });

    if (status && status.id == '1' && status.hasPreLoadedAcronym) {
      return;
    }

    const acronymsEntity = await this.fetchJSONData();
    await this.acronymRepository.save(acronymsEntity);

    const acronymStatus = new AcronymDBState();
    acronymStatus.id = '1';
    acronymStatus.hasPreLoadedAcronym = true;

    await this.acronymDBStateRepository.save(acronymStatus);
  }

  //TODO The relationship for one acronym is to many definitions, need to handle that in the db
  //when prepopulating data have to handle that by checking for duplicates
  private fetchJSONData() {
    return new Promise<Acronym[]>((resolve, reject) => {
      try {
        const data = fs.readFileSync(
          path.join(__dirname, '../../') + 'seedData.json',
          'utf8',
        );

        let acronyms: {
          [acronym: string]: string;
        }[] = JSON.parse(data);

        const acronymsMap = new Map<string, string[]>();

        // After reading and parsing the initial JSON record, 
        // some acronyms have multiple definitions 
        // group them in a map

        acronyms.forEach(acronym => {
          const acronymKey = Object.keys(acronym)[0];
          const newDefinition = Object.values(acronym)[0];
          const definitions = acronymsMap.get(acronymKey);

          if (definitions) {
            definitions.push(newDefinition);
            return;
          }

          acronymsMap.set(acronymKey, [newDefinition]);
        });

        //
        let finalDatas:Acronym[];
        acronymsMap.forEach((definitions, acronym)=>{
          const newAcronym = new Acronym();
          const newDefinition = new Definition()

          newDefinition.acronym = newAcronym
          newDefinition.definition = 
          
          newAcronym.acronym = acronym;
          newAcronym.definitions = ;
        })

        const finalData = acronyms.map(acronym => {
          const newAcronym = new Acronym();
          newAcronym.acronym = Object.keys(acronym)[0];
          newAcronym.definition = Object.values(acronym)[0];
          return newAcronym;
        });
        resolve(finalData);
      } catch (err) {
        reject(err);
      }
    });
  }
}
