import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne
} from "typeorm"
import { LessonEntity } from "./lesson.entity"
import { QuizEntity } from "./quiz.entity"
import { CourseEntity } from "./course.entity"

@Entity('sections')
export class SectionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "longtext", nullable: true })
  details: string;

  @Column()
  position: number;

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

  @OneToMany(() => LessonEntity, (lesson) => lesson.section)
  lessons: LessonEntity[]

  @OneToOne(() => QuizEntity, (quiz) => quiz.section)
  @JoinColumn()
  quiz: QuizEntity

  @ManyToOne(() => CourseEntity, (course) => course.sections)
  course: CourseEntity

  toJSON() {
    return {
      ...this
    };
  }
}