import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, ManyToOne, OneToOne, BeforeInsert, JoinColumn
} from "typeorm"

import { v4 as uuidv4 } from 'uuid';

import { UserEntity } from './user.entity'
import { PharmacyEntity } from "./pharmacy.entity"

@Entity('pharmacies-users')
export class PharmacyUserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  key: string;

  @Column({
    default: 0,
  })
  status: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({
    length: 30,
  })
  role: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(type => PharmacyEntity, pharmacy => pharmacy.keys)
  pharmacy: PharmacyEntity;

  @Column({ type: "uuid" , nullable: true })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.key, { nullable: true })
  @JoinColumn()
  user: UserEntity | null

  @BeforeInsert()
  private beforeInsert() {
    this.key = uuidv4();
  }

  toJSON() {
    return {
      ...this
    };
  }
}
