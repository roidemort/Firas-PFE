import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, OneToMany, ManyToOne
} from "typeorm"
import { QuizEntity } from "./quiz.entity"
import { QuestionResponseEntity } from "./question-response.entity"


import { ImageEntity } from "./image.entity"; // <--- Import this
import { JoinColumn } from "typeorm";

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

  // --- ADD THIS SECTION ---
  @ManyToOne(() => ImageEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'imageId' }) // This creates an 'imageId' column in your DB
  image: ImageEntity;
  // ------------------------

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