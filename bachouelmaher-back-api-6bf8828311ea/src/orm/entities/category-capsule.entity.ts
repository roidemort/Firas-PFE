import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, TreeChildren, TreeParent, Tree, OneToMany
} from "typeorm"
import { CapsuleEntity } from "./capsule.entity"


@Entity('categories-capsule')
@Tree("closure-table", {
  closureTableName: "category-capsule",
  ancestorColumnName: (column) => "ancestor_" + column.propertyName,
  descendantColumnName: (column) => "descendant_" + column.propertyName,
})
export class CategoryCapsuleEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column()
  position: number;

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

  @TreeParent()
  parent: CategoryCapsuleEntity

  @TreeChildren({
    cascade: true,
  })
  children: CategoryCapsuleEntity[];

  @OneToMany(() => CapsuleEntity, (capsule) => capsule.category)
  capsules: CapsuleEntity[]

  toJSON() {
    return {
      ...this,
    };
  }
}