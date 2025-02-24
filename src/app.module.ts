import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './controllers/chat.controller';
import { MeetingController } from './controllers/meeting.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { MeetingRecommendationModule } from './modules/meeting-recommendation/meeting-recommendation.module';
import { SeederModule } from './modules/seed/seeder.module';
import { UserModule } from './modules/users/user.module';
import { AIService } from './services/ai.service';
import { MeetingRecommendationService } from './services/meeting-recommendation-legacy.service';
import { SchoolCalendarModule } from './modules/school-calendar/school-calendar.module';
import { SchoolCalendarController } from './modules/school-calendar/school-calendar.controller';
import { ScraperService } from './modules/school-calendar/scraper.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'ORBITALorbital2024!',
      database: 'shepherdstaff',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    UserModule,
    CalendarModule,
    AuthModule,
    DiscoveryModule,
    SeederModule,
    MeetingRecommendationModule,
    SchoolCalendarModule, //TEST
  ],
  controllers: [ChatController, MeetingController, SchoolCalendarController],
  providers: [AIService, MeetingRecommendationService, ScraperService],
})
export class AppModule {}
