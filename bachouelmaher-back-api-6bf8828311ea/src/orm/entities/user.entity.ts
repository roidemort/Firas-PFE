import bcrypt from 'bcryptjs';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Index,
  PrimaryGeneratedColumn, OneToOne, OneToMany, ManyToMany
} from "typeorm"
import { PharmacyUserEntity } from "./pharmacy-user.entity"
import { SubscriptionEntity } from "./subscription.entity"
import { NotificationEntity } from "./notification.entity"
import { RatingEntity } from "./rating.entity"
import { EnrollCourseEntity } from "./enroll-course.entity"

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index('users-email-idx')
  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
  })
  provider: string;

  @Column({ type: String, nullable: true })
  socialId: string | null;

  @Column({
    nullable: true,
  })
  token: string;

  @Column({
    nullable: true,
  })
  firstName: string;

  @Column({
    nullable: true,
  })
  lastName: string;

  @Column({
    default: 1,
  })
  status: number;

  @Column({
    nullable: true,
  })
  gender: string;

  @Column({
    nullable: true,
    type: 'date'
  })
  birthday: string;

  @Column({
    nullable: true,
  })
  tel: string;

  @Column({
    length: 30,
  })
  role: string;

  @Column({
    nullable: true,
  })
  img_link: string;

  @Column({
    nullable: true,
  })
  address: string;

  @Column({
    nullable: true,
  })
  city: string;

  @Column({
    nullable: true,
  })
  zipCode: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => PharmacyUserEntity, (pharmacyUser) => pharmacyUser.user) // specify inverse side as a second parameter
  key: PharmacyUserEntity

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.buyer)
  purchases: SubscriptionEntity[]

  @OneToMany(() => RatingEntity, (rating) => rating.user)
  ratings: RatingEntity[]

  @OneToMany(() => NotificationEntity, (notification) => notification.receiver)
  notifications: NotificationEntity[]

  @ManyToMany(() => SubscriptionEntity, (subscription) => subscription.users)
  subscribes: SubscriptionEntity[]

  @OneToMany(() => EnrollCourseEntity, (enroll) => enroll.user)
  enrolls: EnrollCourseEntity[]

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  toJSON() {
    return {
      ...this,
      password: undefined,
      provider: undefined,
      token: undefined,
    };
  }
}
