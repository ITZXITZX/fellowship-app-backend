import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScraperService {
  private readonly ACADEMIC_CALENDAR_URL = 'https://www.sp.edu.sg/sp/student-services/academic-calendar';

  async scrapeAcademicDates(): Promise<[string, string][]> {
    try {
      const { data } = await axios.get(this.ACADEMIC_CALENDAR_URL);
      const $ = cheerio.load(data);
      const eventsAndDates: [string, string][] = [];

      $('table tbody tr').each((_, element) => {
        // const eventText = $(element).find('td').eq(0).text().trim(); // First <td> (event/description)
        let eventText = $(element).find('td').eq(0).text().trim(); // First <td> (event/description)
        eventText = eventText.replace(/\s+/g, ' '); // Replace multiple spaces with a single space
        const dateText = $(element).find('td').eq(1).text().trim();  // Second <td> (date)

        if (eventText && dateText) {
          eventsAndDates.push([eventText, dateText]);
        }
      });

      return eventsAndDates;
    } catch (error) {
      console.error('Error scraping academic dates:', error);
      throw new Error('Failed to scrape academic dates');
    }
  }
}
