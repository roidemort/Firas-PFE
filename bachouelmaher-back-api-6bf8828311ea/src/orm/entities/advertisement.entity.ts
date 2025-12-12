import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { ImageEntity } from "./image.entity"

@Entity('advertisement')
export class AdvertisementEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true
  })
  title: string;

  @Column()
  position: number;

  @Column()
  type: string;

  @ManyToOne(type => ImageEntity, { nullable: true })
  image: ImageEntity;

  @Column({
    nullable: true
  })
  video: string;

  @Column("longtext", { nullable: true })
  details: string;

  @Column({
    nullable: true
  })
  permalink: string;

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
}