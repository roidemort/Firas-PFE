import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, ManyToOne, Index, OneToOne, ManyToMany, JoinTable, OneToMany
} from "typeorm"
import { ImageEntity } from "./image.entity"
import { SeoEntity } from "./seo.entity"
import { TrainerEntity } from "./trainer.entity"
import { CourseEntity } from "./course.entity"
import { CapsuleEntity } from "./capsule.entity"

@Entity('providers')
export class ProviderEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column()
  position: number;

  @Index('provider-slug-idx')
  @Column({
    unique: true,
  })
  slug: string;

  @Column({
    default: 1,
  })
  is_searchable: number;

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

  @ManyToOne(type => ImageEntity)
  logo: ImageEntity;

  @OneToOne(type => SeoEntity, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })

  @ManyToMany(() => TrainerEntity, (trainer) => trainer.providers)
  @JoinTable({
    name: "providers-trainers",
  })
  trainers: TrainerEntity[]

  @OneToMany(() => CourseEntity, (course) => course.category)
  courses: CourseEntity[]

  @OneToMany(() => CapsuleEntity, (capsule) => capsule.category)
  capsules: CapsuleEntity[]

  toJSON() {
    return {
      ...this,
    };
  }
}