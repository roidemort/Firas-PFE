import {
  Column,
  CreateDateColumn,
  Entity, Index, ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm"
import { UserEntity } from "./user.entity"
import { CourseEntity } from "./course.entity"
import { EnrollSectionEntity } from "./enroll-section.entity"

@Entity('enroll-courses')
@Index("enroll-courses-index", ["user.id", "course.id"], { unique: true })
export class EnrollCourseEntity {
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
    default: 0
  })
  points: number;

  @Column({
    default: 0
  })
  quizPoints: number;

  @Column({
    default: 0
  })
  quizNumber: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.enrolls)
  user: UserEntity

  @ManyToOne(() => CourseEntity, (course) => course.enrolls)
  course: CourseEntity

  @OneToMany(() => EnrollSectionEntity, (section) => section.course)
  sections: EnrollSectionEntity[]
}