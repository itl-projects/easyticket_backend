import { ApiProperty } from '@nestjs/swagger';
import { Column, DeleteDateColumn, Entity } from 'typeorm';
import { PreEntity } from '../../core/base.entity';

@Entity()
export class MarkUp extends PreEntity {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  price: number;

  @ApiProperty()
  @Column()
  type: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
