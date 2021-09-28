import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { PreEntity } from '../../core/base.entity';

@Entity()
export class Credit extends PreEntity {
  @ApiProperty()
  @Column()
  amount: number;

  @ApiProperty()
  @Column()
  creditRef: string;

  @ApiProperty()
  @Column()
  requestDate: Date;

  @ApiProperty()
  @Column({ default: null })
  transferDate: Date;

  @ApiProperty()
  @Column({ default: '' })
  remark: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'cancelled', 'approved', 'settled'],
    default: 'pending',
  })
  status: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  agent: User;

  @BeforeInsert()
  async generateCreditRef() {
    const refCount = (await Credit.count()) + 1000001;
    this.creditRef = 'ETCRT-' + refCount;
  }
}
