import { ApiProperty } from '@nestjs/swagger';
// import { Booking } from 'src/bookings/entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { PreEntity } from '../../core/base.entity';

@Entity()
export class Ticket extends PreEntity {
  @ApiProperty()
  @Column()
  departureDateTime: Date;

  @ApiProperty()
  @Column()
  arrivalDateTime: Date;

  @ApiProperty()
  @Column()
  source: number;

  @ApiProperty()
  @Column()
  destination: number;

  @ApiProperty()
  @Column()
  airline: number;

  @ApiProperty()
  @Column()
  flightNumber: string;

  @ApiProperty()
  @Column()
  price: number;

  @ApiProperty()
  @Column()
  quantity: number;

  @ApiProperty()
  @Column({ default: false, type: 'boolean' })
  isRefundable: boolean;

  @ApiProperty()
  @Column({ default: false, type: 'boolean' })
  isHotDeal: boolean;

  @ApiProperty()
  @Column()
  note: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @DeleteDateColumn()
  deletedAt?: Date;

  // @OneToMany(() => Booking, (passenger) => passenger.booking)
  // @JoinColumn()
  // passengers: Booking[];

  //   @BeforeInsert()
  //   async hashPassword() {
  //     if (this.password) this.password = await bcrypt.hash(this.password, 8);
  //     else this.password = await bcrypt.hash(this.username, 8);
  //   }

  //   async validatePassword(password: string): Promise<boolean> {
  //     return await bcrypt.compare(password, this.password);
  //   }
}
