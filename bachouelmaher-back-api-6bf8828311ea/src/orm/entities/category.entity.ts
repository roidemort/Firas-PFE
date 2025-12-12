import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, ManyToOne, OneToMany, Index, OneToOne, JoinColumn, TreeChildren, TreeParent, Tree
} from "typeorm"
import { ImageEntity } from "./image.entity"
import { SeoEntity } from "./seo.entity"
import { CourseEntity } from "./course.entity"


@Entity('categories')
@Tree("closure-table", {
  closureTableName: "category",
  ancestorColumnName: (column) => "ancestor_" + column.propertyName,
  descendantColumnName: (column) => "descendant_" + column.propertyName,
})
export class CategoryEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column()
  position: number;

  @Index('category-slug-idx')
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
  banner: ImageEntity;

  @ManyToOne(type => ImageEntity)
  logo: ImageEntity;

  @Column({
    nullable: true
  })
  icon: string;

  @TreeParent()
  parent: CategoryEntity

  @TreeChildren({
    cascade: true,
  })
  children: CategoryEntity[];

  @OneToOne(type => SeoEntity, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  @JoinColumn()
  seo: SeoEntity;

  @OneToMany(() => CourseEntity, (course) => course.category)
  courses: CourseEntity[]

  toJSON() {
    return {
      ...this,
    };
  }
}