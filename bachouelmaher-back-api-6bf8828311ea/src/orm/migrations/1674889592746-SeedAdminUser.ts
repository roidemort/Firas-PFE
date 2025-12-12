import { MigrationInterface, QueryRunner } from "typeorm";
import { AppDataSource } from "../data-source";
import { UserEntity } from "../../orm/entities/user.entity"

export class SeedAdminUser1674889592746 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repo = AppDataSource.getRepository(UserEntity);
    const userData = new UserEntity();
    userData.email = "admin@galiocare.com";
    userData.role = "SUPER_ADMIN";
    userData.password = "password123";
    userData.firstName = 'firstName'
    userData.lastName = 'lastName'
    userData.provider = 'EMAIL'

    const user = repo.create(userData);
    await repo.save(user);
    console.info("Done....");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
