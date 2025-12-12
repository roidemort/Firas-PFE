import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { ImageEntity } from "./image.entity"

@Entity('trend')
export class TrendEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  position: number;

  @Column({
    default: 1,
  })
  status: number;

  @ManyToOne(type => ImageEntity)
  image: ImageEntity;

  @Column({
    nullable: true,
    type: "longtext"
  })
  details: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}