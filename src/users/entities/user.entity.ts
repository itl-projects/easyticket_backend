import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Roles } from '../../constants/Roles';
import { PreEntity } from '../../core/base.entity';
import { UserProfile } from './profile.entity';
import { MarkUp } from 'src/settings/entities/markup.entity';

export enum RoleEnum {
  ADMIN,
  AGENT,
  SUPPLIER,
}

@Entity()
export class User extends PreEntity {
  @ApiProperty()
  @Column()
  firstName: string;

  @ApiProperty()
  @Column()
  lastName: string;

  @Column({ unique: true })
  username: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true })
  phone: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column({ default: false })
  isActive: boolean;

  @Column({ default: 0 })
  commision: number;

  @ApiProperty()
  @Column({ default: Roles.USER })
  role: number;

  @ApiProperty()
  @Column({ default: true })
  ticketLogoEnabled: boolean;

  @ApiProperty()
  @Column({ default: false })
  ticketAmountEnabled: boolean;

  @OneToOne(() => UserProfile)
  @JoinColumn()
  profile: UserProfile;

  @ManyToOne(() => MarkUp, (markup) => markup.id)
  @JoinColumn()
  markup: MarkUp;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) this.password = await bcrypt.hash(this.password, 8);
    else this.password = await bcrypt.hash(this.username, 8);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  async hashNewPassword(password: string) {
    return await bcrypt.hash(password, 8);
  }
}
