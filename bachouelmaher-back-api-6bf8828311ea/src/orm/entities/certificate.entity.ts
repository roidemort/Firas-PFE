import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, ManyToOne
} from "typeorm"
import { ImageEntity } from "./image.entity"


@Entity('certificates')
export class CertificateEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  title: string;

  @Column({
    nullable: true,
  })
  sub_title: string;

  @Column("longtext", { nullable: true})
  description: string;

  @Column({
    nullable: true,
    type: 'json'
  })
  positionTitle: string;

  @Column({
    nullable: true,
    type: 'json'
  })
  positionSubTitle: string;

  @Column({
    nullable: true,
    type: 'json'
  })
  positionDescription: string;

  @Column({
    nullable: true,
    type: 'json'
  })
  positionSignature: string;

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
  background: ImageEntity;

  @ManyToOne(type => ImageEntity)
  signature: ImageEntity;


  toJSON() {
    return {
      ...this,
    };
  }
}