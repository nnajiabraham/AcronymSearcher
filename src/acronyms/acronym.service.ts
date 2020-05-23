import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Like, Repository } from 'typeorm';
import { CreateAcronymDto } from './dto/createAcronym.dto';
import { Acronym, AcronymDBState } from './entity/acronym.entity';
import { Definition } from './entity/definition.entity';

@Injectable()
export class AcronymService {
  constructor(
    @InjectRepository(Acronym) private acronymRepository: Repository<Acronym>,
    @InjectRepository(Definition)
    private definitionRepository: Repository<Definition>,
    @InjectRepository(AcronymDBState)
    private acronymDBStateRepository: Repository<AcronymDBState>,
  ) {}

  //TODO The relationship for one acronym is to many definitions, need to handle that in the db
  async createAcronym(acronym: CreateAcronymDto): Promise<Definition> {
    const prevSaved = await this.acronymRepository.find({
      where: { acronym: Like(acronym.acronym) },
    });

    if (prevSaved.length == 0) {
      const newAcronym = new Acronym();
      newAcronym.acronym = acronym.acronym;
      await this.acronymRepository.save(newAcronym);

      const newDefinition = new Definition();
      newDefinition.definition = acronym.definition;
      newDefinition.acronym = newAcronym;

      const savedDefinition = await this.definitionRepository.save(
        newDefinition,
      );

      return savedDefinition;
    }

    const newDefinition = new Definition();
    newDefinition.definition = acronym.definition;
    newDefinition.acronym = prevSaved[0];

    const savedDefinition = await this.definitionRepository.save(newDefinition);
    return savedDefinition;
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

    const newAcronyms = new Map<string, Acronym>();

    const acronymsEntity = await this.fetchJSONData();

    acronymsEntity.forEach(async (definitions, acronym) => {
      const newAcronym = new Acronym();
      newAcronym.acronym = acronym;

      await this.acronymRepository.save(newAcronym);

      newAcronyms.set(acronym, newAcronym);

      definitions.forEach(definition => {
        definition.acronym = newAcronym;
      });

      await this.definitionRepository.save(definitions);
    });

    const acronymStatus = new AcronymDBState();
    acronymStatus.id = '1';
    acronymStatus.hasPreLoadedAcronym = true;

    await this.acronymDBStateRepository.save(acronymStatus);
  }

  //TODO The relationship for one acronym is to many definitions, need to handle that in the db
  //when prepopulating data have to handle that by checking for duplicates
  private fetchJSONData() {
    return new Promise<Map<string, Definition[]>>((resolve, reject) => {
      try {
        const data = fs.readFileSync(
          path.join(__dirname, '../../') + 'seedData.json',
          'utf8',
        );

        let acronyms: {
          [acronym: string]: string;
        }[] = JSON.parse(data);

        const acronymsMap = new Map<string, Definition[]>();

        // After reading and parsing the initial JSON record,
        // some acronyms have multiple definitions
        // group them in a map

        acronyms.forEach(acronym => {
          // const acronymObjKey = new Acronym();
          // acronymObjKey.acronym = Object.keys(acronym)[0];

          const acronymKey = Object.keys(acronym)[0];

          const definitionObj = new Definition();
          definitionObj.definition = Object.values(acronym)[0];

          // const newDefinition = Object.values(acronym)[0];

          if (acronymsMap.has(acronymKey)) {
            acronymsMap.get(acronymKey).push(definitionObj);
            return;
          }

          acronymsMap.set(acronymKey, [definitionObj]);
        });

        resolve(acronymsMap);
      } catch (err) {
        reject(err);
      }
    });
  }
}
