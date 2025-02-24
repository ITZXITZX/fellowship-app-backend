import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as moment from 'moment'; 


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

  async scrapeFilteredAcademicDates(): Promise<string[]> {
    const eventsAndDates = await this.scrapeAcademicDates();

    if (eventsAndDates.length === 0) {
      return [];
    }

    // Find full academic year range
    const allDates = eventsAndDates.map(([_, date]) => date);
    const firstDate = moment(allDates[0], "D MMM YYYY"); // Start of the academic year
    const lastDate = moment(allDates[allDates.length - 1], "D MMM YYYY"); // End of the academic year

    // Find vacation periods
    const vacationRanges = eventsAndDates
      .filter(([event, _]) => event.toLowerCase() === "vacation")
      .map(([_, date]) => this.parseDateRange(date)); // Convert vacation date string to moment range

    // Calculate non-vacation periods
    const availablePeriods = this.calculateNonVacationPeriods(firstDate, lastDate, vacationRanges);

    return availablePeriods.map(([start, end]) => `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`);
  }

  private parseDateRange(dateStr: string): [moment.Moment, moment.Moment] {
    const [startStr, endStr] = dateStr.split(' - ');
    return [moment(startStr, "D MMM YYYY"), moment(endStr, "D MMM YYYY")];
  }

  private calculateNonVacationPeriods(
    academicStart: moment.Moment,
    academicEnd: moment.Moment,
    vacations: [moment.Moment, moment.Moment][]
  ): [moment.Moment, moment.Moment][] {
    const availablePeriods: [moment.Moment, moment.Moment][] = [];
    let currentStart = academicStart.clone();

    for (const [vacStart, vacEnd] of vacations) {
      if (currentStart.isBefore(vacStart)) {
        availablePeriods.push([currentStart, vacStart.clone().subtract(1, 'days')]); // Period before vacation
      }
      currentStart = vacEnd.clone().add(1, 'days'); // Resume after vacation
    }

    // Add the last remaining period
    if (currentStart.isBefore(academicEnd)) {
      availablePeriods.push([currentStart, academicEnd]);
    }

    return availablePeriods;
  }


  // // Method 2: Filter out "Vacation" events & combine all dates
  // async scrapeFilteredAcademicDates(): Promise<string> {
  //   const eventsAndDates = await this.scrapeAcademicDates();
    
  //   // Filter out "Vacation" rows
  //   const filteredDates = eventsAndDates
  //     .filter(([event, _]) => event.toLowerCase() !== "vacation")
  //     .map(([_, date]) => date); // Extract only the dates

  //   // Combine dates into a single string (comma-separated)
  //   return filteredDates.join(', ');
  // }

}
