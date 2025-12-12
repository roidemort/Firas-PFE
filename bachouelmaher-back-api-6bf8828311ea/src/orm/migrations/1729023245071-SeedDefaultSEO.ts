import { MigrationInterface, QueryRunner } from "typeorm"

import { AppDataSource } from "../data-source";
import { SeoEntity, MetaEntity } from "../../orm/entities/seo.entity"

export class SeedDefaultSEO1729023245071 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const repoSeo = AppDataSource.getRepository(SeoEntity);
        const repoMeta = AppDataSource.getRepository(MetaEntity);

        const seoData = new SeoEntity();

        seoData.robots = 'index,follow'
        seoData.status = 0
        seoData.mapping = 'General'
        seoData.title = 'Elevate Your Skills in Medical Care - Pharmacare'
        seoData.permalink = 'default'

        const seo = repoSeo.create(seoData);
        await repoSeo.save(seo);

        const metaData = new MetaEntity();
        const metaData2 = new MetaEntity();

        metaData.name = 'description'
        metaData.content = 'pharmacare description'
        metaData.seo = seo

        metaData2.name = 'og:title'
        metaData2.content = 'pharmacare  og'
        metaData2.seo = seo

        const meta = repoMeta.create(metaData);
        const meta2 = repoMeta.create(metaData2);

        await repoMeta.save(meta);
        await repoMeta.save(meta2);

        console.info("Done....");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
