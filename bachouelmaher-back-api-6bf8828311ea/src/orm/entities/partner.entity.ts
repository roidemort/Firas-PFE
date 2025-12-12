import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, ManyToOne
} from "typeorm"
import { ImageEntity } from "./image.entity"

@Entity('partners')
export class PartnerEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  position: number;

  @Column({
    default: 1,
  })
  status: number;

  @ManyToOne(type => ImageEntity)
  logo: ImageEntity;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return {
      ...this
    };
  }
}
