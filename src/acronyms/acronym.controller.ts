import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AcronymService } from './acronym.service';
import { CreateAcronymDto } from './dto/createAcronym.dto';
import { HTTPResponseDto } from './dto/response.dto';
import { UpdateAcronymDto } from './dto/updateAcronym.dto';
import { Acronym } from './entity/acronym.entity';
import { Definition } from './entity/definition.entity';

@Controller('acronym')
export class AcronymController {
  constructor(private readonly acronymService: AcronymService) {}

  //TODO add result count and add count to header
  @Get()
  async searchAcronyms(
    @Query('search') search: string,
    @Query('from') from: number,
    @Query('limit') limit: number,
  ) {
    try {
      const resp = await this.acronymService.searchAcronym(search, from, limit);
      return new HTTPResponseDto<[Acronym[], number]>(200, resp, null);
    } catch (e) {
      console.error('Error occurred search for Acronym ', e);
      throw new InternalServerErrorException('Unable to search for acronym');
    }
  }

  @Post()
  async addAcronym(@Body() payload: CreateAcronymDto) {
    try {
      const resp = await this.acronymService.createAcronym(payload);
      return new HTTPResponseDto<Definition>(200, resp, null);
    } catch (e) {
      console.error('Error occurred creating a new Acronym ', e);
      throw new InternalServerErrorException('Unable to save acronym');
    }
  }

  @Get(':acronym')
  async getAcronym(@Param('acronym') acronym: string) {
    try {
      const resp = await this.acronymService.getAcronymDefinition(acronym);
      return new HTTPResponseDto<Acronym[]>(200, resp, null);
    } catch (e) {
      console.error('Error occurred retrieving Acronym ', e);
      throw new InternalServerErrorException('Unable to retrieve acronym');
    }
  }

  @Get('random/:count')
  async getRandom(@Param('count') count: number) {
    try {
      const resp = await this.acronymService.getRandomRecords(count);
      return new HTTPResponseDto<Acronym[]>(200, resp, null);
    } catch (e) {
      console.error('Error occurred retrieving Acronym ', e);
      throw new InternalServerErrorException('Unable to retrieve acronym');
    }
  }

  @Put(':acronym')
  async updateAcronym(
    @Param('acronym') acronym: string,
    @Body() payload: UpdateAcronymDto,
  ) {
    if (!payload || !payload.definitionId || !payload.definition) {
      throw new BadRequestException('Missing definitionId or definition');
    }

    const resp = await this.acronymService.updateAcronym(acronym, payload);
    return new HTTPResponseDto<Definition>(200, resp, null);
  }

  @Delete(':acronym')
  async deleteAcronym(
    @Param('acronym') acronym: string,
    @Body() payload: UpdateAcronymDto,
  ) {
    if (!payload || !payload.definition) {
      throw new BadRequestException('Missing definitionId or definition');
    }

    const update = new Acronym();
    const newDefinition = new Definition();

    newDefinition.definition = payload.definition;
    update.acronym = acronym;
    update.definitions = [newDefinition];

    // const resp = await this.acronymService.updateAcronym(acronym, update);
    // return new HTTPResponseDto<Acronym>(200, "resp", null);
  }
}
