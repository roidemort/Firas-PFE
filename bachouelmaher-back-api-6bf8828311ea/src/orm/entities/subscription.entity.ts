import {
  Column,
  CreateDateColumn,
  Entity, JoinTable, ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm"
import { UserEntity } from "./user.entity";
import { PackageEntity } from "./package.entity"

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    default: 1,
  })
  status: number;

  @Column({
    nullable: true,
  })
  startedAt: Date;

  @Column({
    nullable: true,
  })
  endedAt: Date;

  @Column({
    nullable: true,
  })
  usersNumber: number;

  @Column({
    default: 'online',
  })
  paymentMethod: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    nullable: true,
  })
  secure_url: string;

  @Column({
    nullable: true,
  })
  public_id: string;

  @ManyToOne(() => UserEntity, (user) => user.purchases)
  buyer: UserEntity

  @ManyToOne(() => PackageEntity)
  package: PackageEntity

  @ManyToMany(() => UserEntity, (user) => user.subscribes)
  @JoinTable({
    name: "users-subscriptions",
  })
  users: UserEntity[]

  toJSON() {
    return {
      ...this,
    };
  }
}