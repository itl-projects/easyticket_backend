import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { PreEntity } from '../../core/base.entity';
import { Passenger } from './passenger.entity';

@Entity()
export class Booking extends PreEntity {
  @ApiProperty()
  @Column()
  amount: number;

  @ApiProperty()
  @Column({ default: '' })
  pnr: string;

  @ApiProperty()
  @Column()
  bookingRef: string;

  @ApiProperty()
  @Column()
  passengerCount: number;

  @ManyToOne(() => Ticket)
  ticket: Ticket;

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => Passenger, (passenger) => passenger.booking)
  @JoinColumn()
  passengers: Passenger[];

  @BeforeInsert()
  async generateBookingRef() {
    this.bookingRef = 'AET-' + (await Booking.count()) + 1000001;
  }
}
