import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// entities
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/profile.entity';
import { UserMarkup } from '../users/entities/markup.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Passenger } from 'src/bookings/entities/passenger.entity';
import { MarkUp } from 'src/settings/entities/markup.entity';

// mobules
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TicketsModule } from 'src/tickets/tickets.module';
import { FlightsModule } from 'src/flights/flights.module';
import { BookingsModule } from 'src/bookings/bookings.module';
import { SettingsModule } from 'src/settings/settings.module';
import { Credit } from 'src/credits/entities/credit.entity';
import { CreditsModule } from 'src/credits/credits.module';

const entities = [
  User,
  UserProfile,
  Ticket,
  Booking,
  Passenger,
  MarkUp,
  UserMarkup,
  Credit,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: entities,
        synchronize: false,
        autoLoadEntities: true,
        // timezone: '+05:30',
      }),
    }),
    AuthModule,
    UsersModule,
    TicketsModule,
    FlightsModule,
    BookingsModule,
    SettingsModule,
    CreditsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    process.env.TZ = 'Asia/Kolkata';
  }
}
