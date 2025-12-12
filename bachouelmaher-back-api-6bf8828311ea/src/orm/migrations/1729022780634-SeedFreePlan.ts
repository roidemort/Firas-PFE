import { MigrationInterface, QueryRunner } from "typeorm"
import { AppDataSource } from "../data-source";
import { PackageEntity } from "../../orm/entities/package.entity"

export class SeedFreePlan1729022780634 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const repo = AppDataSource.getRepository(PackageEntity);
        const packageData = new PackageEntity();
        packageData.id = '4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2'
        packageData.name = "Freemium"
        packageData.description = "<ul><li>Access to all basic features</li><li>Up to 10 individual users</li><li>20GB individual data each user</li></ul>"
        packageData.duration = 0
        packageData.price = 0
        packageData.position = 1
        packageData.type = 'DT/mois par utilisateur'

        const pack = repo.create(packageData);
        await repo.save(pack);
        console.info("Done....");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
