import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Acronym } from './acronym.entity';
import { AcronymService } from './acronym.service';
import { CreateAcronymDto } from './dto/createAcronym.dto';
import { HTTPResponseDto } from './dto/response.dto';
import { UpdateAcronymDto } from './dto/updateAcronym.dto';

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
    const newAcronym = new Acronym();
    newAcronym.acronym = payload.acronym;
    newAcronym.definition = payload.definition;

    try {
      const resp = await this.acronymService.createAcronym(newAcronym);
      return new HTTPResponseDto<Acronym>(200, resp, null);
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
    if (!payload || !payload.definition) {
      throw new BadRequestException('Missing appropriate payload');
    }

    const update = new Acronym();
    update.acronym = payload.acronym ? payload.acronym : acronym;
    update.definition = payload.definition;

    const resp = await this.acronymService.updateAcronym(acronym, update);
    return new HTTPResponseDto<Acronym>(200, resp, null);
  }
}
