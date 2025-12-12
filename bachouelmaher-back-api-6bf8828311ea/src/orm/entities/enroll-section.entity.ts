import {
  Column,
  CreateDateColumn,
  Entity, ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm"

import { EnrollLessonEntity } from "./enroll-lesson.entity"
import { EnrollQuizEntity } from "./enroll-quiz.entity"
import { EnrollCourseEntity } from "./enroll-course.entity"
import { SectionEntity } from "./section.entity"

@Entity('enroll-sections')
export class EnrollSectionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    default: 0,
  })
  status: number;

  @Column()
  position: number;

  @Column({
    nullable: true,
  })
  startedAt: Date;

  @Column({
    nullable: true,
  })
  endedAt: Date;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EnrollLessonEntity, (lesson) => lesson.section)
  lessons: EnrollLessonEntity[]

  @OneToMany(() => EnrollQuizEntity, (quiz) => quiz.section)
  quiz: EnrollQuizEntity[]

  @ManyToOne(() => EnrollCourseEntity, (course) => course.sections)
  course: EnrollCourseEntity

  @ManyToOne(() => SectionEntity)
  section: SectionEntity
}