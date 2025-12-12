import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, ManyToMany, ManyToOne
} from "typeorm"
import { ProviderEntity } from "./provider.entity"
import { ImageEntity } from "./image.entity"


@Entity('trainers')
export class TrainerEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  twitter: string;

  @Column({
    nullable: true,
  })
  job: string;

  @ManyToOne(type => ImageEntity)
  image: ImageEntity;

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

  @ManyToMany(() => ProviderEntity, (provider) => provider.trainers)
  providers: ProviderEntity[]

  toJSON() {
    return {
      ...this,
    };
  }
}