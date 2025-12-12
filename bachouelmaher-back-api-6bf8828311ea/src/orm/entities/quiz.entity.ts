import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn
} from "typeorm"
import { QuestionEntity } from "./question.entity"
import { SectionEntity } from "./section.entity"

@Entity('quiz')
export class QuizEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "longtext", nullable: true })
  details: string;

  @Column({nullable: true })
  passingGrade: number;

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

  @OneToMany(() => QuestionEntity, (question) => question.quiz)
  questions: QuestionEntity[]

  @OneToOne(() => SectionEntity, (section) => section.quiz)
  @JoinColumn()
  section: SectionEntity

  toJSON() {
    return {
      ...this
    };
  }
}