import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { UserEntity } from "./user.entity"
import { CourseEntity } from "./course.entity"

@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

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

  @ManyToOne(() => UserEntity)
  receiver: UserEntity

  @ManyToOne(() => UserEntity)
  sender: UserEntity

  @ManyToOne(() => CourseEntity)
  course: CourseEntity

  toJSON() {
    return {
      ...this
    };
  }
}