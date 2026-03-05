import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, OneToMany
} from "typeorm"

import { PharmacyUserEntity } from "./pharmacy-user.entity"

@Entity('pharmacies')
export class PharmacyEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  email: string;

  @Column()
  tel: string;

  @Column({
    default: 1,
  })
  status: number;

  @Column({
    nullable: true,
  })
  city: string;

  @Column({
    nullable: true,
  })
  zipCode: string;

  @Column({ default: 0 })
  maxPharmacists: number;

  @Column({ default: 0 })
  maxPreparers: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(type => PharmacyUserEntity, pharmacyUser => pharmacyUser.pharmacy)
  keys: PharmacyUserEntity[];

  toJSON() {
    return {
      ...this
    };
  }
}
