import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from "typeorm"

@Entity('registration_requests')
export class RegistrationRequestEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  pharmacyName: string;

  @Column()
  pharmacyEmail: string;

  @Column()
  pharmacyAddress: string;

  @Column()
  pharmacyPhone: string;

  @Column()
  nbPharmacien: number;

  @Column()
  nbPreparatoire: number;

  @Column()
  ownerLastName: string;

  @Column()
  ownerFirstName: string;

  @Column({
    default: 0, // 0 = pending, 1 = approved, 2 = rejected
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
