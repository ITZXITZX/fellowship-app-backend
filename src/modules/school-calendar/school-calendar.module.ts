import { Module } from '@nestjs/common';
import { SchoolCalendarController } from './school-calendar.controller';
import { ScraperService } from './scraper.service';

@Module({
  controllers: [SchoolCalendarController],
  providers: [ScraperService],
  exports: [ScraperService] // Allows other modules to use ScraperService if needed
})
export class SchoolCalendarModule {}
