import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, ManyToOne
} from "typeorm"

import { EnrollSectionEntity } from "./enroll-section.entity"
import { LessonEntity } from "./lesson.entity"

@Entity('enroll-lessons')
export class EnrollLessonEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  position: number;

  @Column({
    nullable: true
  })
  pause: string;

  @Column({
    nullable: true,
  })
  startedAt: Date;

  @Column({
    nullable: true,
  })
  endedAt: Date;

  @Column({
    default: 0,
  })
  status: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => EnrollSectionEntity, (section) => section.lessons)
  section: EnrollSectionEntity

  @ManyToOne(() => LessonEntity)
  lesson: LessonEntity

  toJSON() {
    return {
      ...this
    };
  }
}