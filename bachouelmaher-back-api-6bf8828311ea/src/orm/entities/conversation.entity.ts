import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { UserEntity } from "./user.entity"
import { CourseEntity } from "./course.entity"

@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("longtext")
  content: string;

  @Column({ type: 'boolean', default: false })
  isAnswered: boolean;

  @Column({ type: 'varchar', length: 20, default: 'private' })
  visibility: string;

  @Column({ type: 'boolean', default: false })
  isHidden: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'datetime', nullable: true })
  answeredAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  moderatedAt: Date | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  pharmacistAlias: string | null;

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

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'laboId' })
  labo: UserEntity | null

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'moderatedById' })
  moderatedBy: UserEntity | null

  @ManyToOne(() => CourseEntity)
  course: CourseEntity

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.replies, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: ConversationEntity | null

  @OneToMany(() => ConversationEntity, (conversation) => conversation.parent)
  replies: ConversationEntity[]

  toJSON() {
    return {
      ...this
    };
  }
}