import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, ManyToOne
} from "typeorm"
import { SectionEntity } from "./section.entity"

@Entity('lessons')
export class LessonEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: "longtext", nullable: true })
  details: string;

  @Column()
  position: number;

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

  @ManyToOne(() => SectionEntity, (section) => section.lessons)
  section: SectionEntity

  toJSON() {
    return {
      ...this
    };
  }
}