import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { UserEntity } from "./user.entity"
import { CourseEntity } from "./course.entity"

@Entity('ratings')
export class RatingEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("int")
  rating: number;

  @Column("longtext", { nullable: true })
  comment: string;

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

  @ManyToOne(() => UserEntity, (user) => user.ratings)
  user: UserEntity;

  @ManyToOne(() => CourseEntity, (course) => course.ratings)
  course: CourseEntity;
}