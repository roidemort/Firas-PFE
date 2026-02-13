import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, Index, OneToMany, ManyToOne, ManyToMany, JoinTable
} from "typeorm"
import { SectionEntity } from "./section.entity"
import { CategoryEntity } from "./category.entity"
import { ImageEntity } from "./image.entity"
import { ProviderEntity } from "./provider.entity"
import { TrainerEntity } from "./trainer.entity"
import { CertificateEntity } from "./certificate.entity"
import { RatingEntity } from "./rating.entity"
import { EnrollCourseEntity } from "./enroll-course.entity"

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  previewVideo: string;

  @Column("longtext")
  details: string;

  @Index('course-slug-idx')
  @Column({
    unique: true,
  })
  slug: string;

  @Column()
  points: number;

  @Column()
  expiration: number;

  @Column()
  duration: string;

  @Column()
  language: string;

  @Column()
  level: string;

  @Column()
  paid: boolean;

  @Column("simple-array")
  roles: string[]

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  price: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  discountPrice: number;

  @Column()
  comingSoon: boolean;

  @Column({ default: false })
  free: boolean;

  @Column({ nullable: true })
  messageComingSoon: string;

  @Column({ nullable: true })
  endTimeComingSoon: string;

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

  @OneToMany(() => SectionEntity, (section) => section.course)
  sections: SectionEntity[]

  @ManyToOne(() => CategoryEntity, (category) => category.courses)
  category: CategoryEntity

  @ManyToOne(type => ImageEntity)
  preview: ImageEntity;

  @ManyToOne(() => ProviderEntity, (provider) => provider.courses)
  provider: ProviderEntity

  @ManyToMany(() => TrainerEntity)
  @JoinTable({
    name: "courses-trainers",
  })
  trainers: TrainerEntity[]

  @OneToMany(() => EnrollCourseEntity, (enroll) => enroll.course)
  enrolls: EnrollCourseEntity[]

  @OneToMany(() => RequirementEntity, (req) => req.course, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  requirements: RequirementEntity[];

  @OneToMany(() => FAQEntity, (faq) => faq.course, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  faqs: FAQEntity[];

  @OneToMany(() => IncludeEntity, (inc) => inc.course, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  includes: IncludeEntity[];

  @OneToMany(() => ObjectiveEntity, (obj) => obj.course, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  objectives: ObjectiveEntity[];

  @ManyToOne(type => CertificateEntity)
  certificate: CertificateEntity

  @OneToMany(() => RatingEntity, (rating) => rating.course)
  ratings: RatingEntity[]

  toJSON() {
    return {
      ...this
    };
  }
}

@Entity('requirements')
export class RequirementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("longtext", { nullable: true})
  value: string;

  @ManyToOne(() => CourseEntity, (course) => course.requirements, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  course: CourseEntity;

  toJSON() {
    return {
      ...this,
    };
  }
}

@Entity('faqs')
export class FAQEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("longtext", { nullable: true})
  content: string;

  @ManyToOne(() => CourseEntity, (course) => course.faqs, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  course: CourseEntity;

  toJSON() {
    return {
      ...this,
    };
  }
}

@Entity('includes')
export class IncludeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  icon: string;

  @Column()
  text: string;

  @ManyToOne(() => CourseEntity, (course) => course.includes, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  course: CourseEntity;

  toJSON() {
    return {
      ...this,
    };
  }
}

@Entity('objectives')
export class ObjectiveEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("longtext", { nullable: true})
  value: string;

  @ManyToOne(() => CourseEntity, (course) => course.objectives, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  course: CourseEntity;

  toJSON() {
    return {
      ...this,
    };
  }
}