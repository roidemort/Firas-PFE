import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm"


@Entity('packages')
export class PackageEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("longtext")
  description: string;

  @Column({
    nullable: true,
  })
  duration: number;

  @Column('decimal', { precision: 6, scale: 2 })
  price: number;

  @Column()
  type: string;

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

  toJSON() {
    return {
      ...this,
    };
  }
}