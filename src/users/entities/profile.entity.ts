// import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { PreEntity } from '../../core/base.entity';

@Entity()
export class UserProfile extends PreEntity {
  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ unique: true })
  company: string;

  @Column()
  pan: string;
}
