import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { ProviderEntity } from "./provider.entity"
import { CategoryCapsuleEntity } from "./category-capsule.entity"

@Entity('capsule')
export class CapsuleEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column("longtext")
  details: string;

  @Column()
  url: string;

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

  @ManyToOne(() => CategoryCapsuleEntity, (category) => category.capsules)
  category: CategoryCapsuleEntity

  @ManyToOne(() => ProviderEntity, (provider) => provider.capsules)
  provider: ProviderEntity
}