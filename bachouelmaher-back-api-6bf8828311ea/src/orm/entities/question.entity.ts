import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, OneToMany, ManyToOne
} from "typeorm"
import { QuizEntity } from "./quiz.entity"
import { QuestionResponseEntity } from "./question-response.entity"

@Entity('questions')
export class QuestionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  text: string;

  @Column()
  type: string;

  @Column()
  topic: string;

  @Column()
  answer: string;

  @Column()
  points: number;

  @Column({ nullable: true })
  a: string;

  @Column({ nullable: true })
  b: string;

  @Column({ nullable: true })
  c: string;

  @Column({ nullable: true })
  d: string;

  @Column({ type: "longtext", nullable: true })
  justification: string;

  @Column({ type: "longtext", nullable: true })
  details: string;

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

  @ManyToOne(() => QuizEntity, (quiz) => quiz.questions)
  quiz: QuizEntity

  @OneToMany(() => QuestionResponseEntity, (response) => response.question)
  responses: QuestionResponseEntity[]

  toJSON() {
    return {
      ...this
    };
  }
}