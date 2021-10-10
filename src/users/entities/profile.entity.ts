// import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { PreEntity } from '../../core/base.entity';

@Entity()
export class UserProfile extends PreEntity {
  @Column({ nullable: true })
  profile_image: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ unique: true })
  company: string;

  @Column({ nullable: true })
  pan: string;

  @Column({ nullable: true })
  address: string;
}
