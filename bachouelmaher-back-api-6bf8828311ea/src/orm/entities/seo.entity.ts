import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn, Index, ManyToOne, OneToMany, Unique
} from "typeorm"

@Entity('seo')
@Unique(["permalink", "mapping"])
export class SeoEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true
  })
  title: string;

  @Column({
    nullable: true
  })
  robots: string;

  @Index('seo-permalink-idx')
  @Column()
  permalink: string;

  @Column({
    default: 1,
  })
  status: number;

  @Column({
    default: 'Entity',
  })
  mapping: string;

  @OneToMany(() => MetaEntity, (meta) => meta.seo, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  metaTags: MetaEntity[];

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


@Entity('meta')
export class MetaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true
  })
  name: string;

  @Column({
    nullable: true
  })
  property: string;

  @Column()
  content: string;

  @ManyToOne(() => SeoEntity, (seo) => seo.metaTags, {
    onDelete: "CASCADE", onUpdate: "CASCADE",
  })
  seo: SeoEntity;

  toJSON() {
    return {
      ...this,
    };
  }
}
