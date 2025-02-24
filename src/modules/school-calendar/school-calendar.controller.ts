import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { ScraperService } from './scraper.service';

@Controller('school-calendar')
export class SchoolCalendarController {
  constructor(private readonly scraperService: ScraperService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('academic-dates')
  async getAcademicDates() {
    return await this.scraperService.scrapeAcademicDates();
  }
}
