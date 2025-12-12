import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { UserEntity } from "./user.entity"

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column("longtext")
  content: string;

  @Column({
    default: 1,
  })
  status: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.notifications)
  receiver: UserEntity

  @ManyToOne(() => UserEntity)
  sender: UserEntity

  toJSON() {
    return {
      ...this
    };
  }
}