import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { QuestionEntity } from "./question.entity"
import { EnrollQuizEntity } from "./enroll-quiz.entity"

@Entity('question-response')
export class QuestionResponseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    default: 0,
  })
  status: number;

  @Column({
    nullable : true
  })
  response: string;

  @Column({
    nullable : true
  })
  isCorrect: boolean;

  @Column({
    nullable : true
  })
  score: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => QuestionEntity, (question) => question.responses)
  question : QuestionEntity

  @ManyToOne(() => EnrollQuizEntity, (quiz) => quiz.questions)
  quiz : EnrollQuizEntity
}