// import { ApiProperty } from '@nestjs/swagger';
import { MarkUp } from 'src/settings/entities/markup.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PreEntity } from '../../core/base.entity';
import { User } from './user.entity';

@Entity()
export class UserMarkup extends PreEntity {
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => MarkUp, (markup) => markup.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  markup: MarkUp;
}
