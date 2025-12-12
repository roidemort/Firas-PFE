import { MigrationInterface, QueryRunner } from "typeorm"
import { AppDataSource } from "../data-source";
import { PackageEntity } from "../../orm/entities/package.entity"

export class SeedFreePlan1729022780635 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const repo = AppDataSource.getRepository(PackageEntity);
        const packageData = new PackageEntity();
        packageData.id = '4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e3'
        packageData.name = "Custom"
        packageData.description = "Custom"
        packageData.duration = 0
        packageData.price = 0
        packageData.position = 40
        packageData.type = 'DT/mois par utilisateur'

        const pack = repo.create(packageData);
        await repo.save(pack);
        console.info("Done....");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
