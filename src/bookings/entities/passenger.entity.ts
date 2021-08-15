import { ApiProperty } from '@nestjs/swagger';
import { Booking } from './booking.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PreEntity } from '../../core/base.entity';

@Entity()
export class Passenger extends PreEntity {
  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  firstName: string;

  @ApiProperty()
  @Column()
  lastName: string;

  @ApiProperty()
  @Column()
  mobile: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  note: string;

  @ManyToOne(() => Booking)
  @JoinColumn()
  booking: Booking;

  //   @BeforeInsert()
  //   async hashPassword() {
  //     if (this.password) this.password = await bcrypt.hash(this.password, 8);
  //     else this.password = await bcrypt.hash(this.username, 8);
  //   }

  //   async validatePassword(password: string): Promise<boolean> {
  //     return await bcrypt.compare(password, this.password);
  //   }
}
