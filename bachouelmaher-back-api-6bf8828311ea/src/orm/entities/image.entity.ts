import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from "typeorm"


@Entity('images')
export class ImageEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  filename: string;

  @Column()
  secure_url: string;

  @Column()
  public_id: string;

  @Column()
  size: number;

  @Column()
  height: number;

  @Column()
  width: number;

  @Column()
  format: string;

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

  toJSON() {
    return {
      ...this
    };
  }
}
