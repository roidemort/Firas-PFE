import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, OneToMany, ManyToOne
} from "typeorm"
import { QuestionResponseEntity } from "./question-response.entity"
import { EnrollSectionEntity } from "./enroll-section.entity"
import { QuizEntity } from "./quiz.entity"

@Entity('enroll-quiz')
export class EnrollQuizEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: 0 })
  score: number;

  @Column({
    default: 0,
  })
  status: number;

  @Column({
    default: 0,
  })
  nbrQuestionsCorrect: number;

  @Column({
    default: 0,
  })
  earnedPoints: number;

  @Column({
    default: 0,
  })
  totalPoints: number;

  @Column({
    default: false
  })
  successful: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => QuestionResponseEntity, (question) => question.quiz)
  questions: QuestionResponseEntity[]

  @ManyToOne(() => EnrollSectionEntity, (section) => section.quiz)
  section: EnrollSectionEntity

  @ManyToOne(() => QuizEntity)
  quiz: QuizEntity

  toJSON() {
    return {
      ...this
    };
  }
}