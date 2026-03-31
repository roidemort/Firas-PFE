import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class EnhanceLaboChatConversation1760000000003 implements MigrationInterface {
  name = 'EnhanceLaboChatConversation1760000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conversations');
    if (!table) {
      return;
    }

    const addColumnIfMissing = async (column: TableColumn) => {
      const hasColumn = table.columns.some((item) => item.name === column.name)
        || await queryRunner.hasColumn('conversations', column.name);

      if (!hasColumn) {
        await queryRunner.addColumn('conversations', column);
      }
    };

    await addColumnIfMissing(new TableColumn({ name: 'isAnswered', type: 'boolean', default: false }));
    await addColumnIfMissing(new TableColumn({ name: 'visibility', type: 'varchar', length: '20', default: "'private'" }));
    await addColumnIfMissing(new TableColumn({ name: 'isHidden', type: 'boolean', default: false }));
    await addColumnIfMissing(new TableColumn({ name: 'isDeleted', type: 'boolean', default: false }));
    await addColumnIfMissing(new TableColumn({ name: 'answeredAt', type: 'datetime', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'moderatedAt', type: 'datetime', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'pharmacistAlias', type: 'varchar', length: '80', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'laboId', type: 'varchar', length: '36', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'moderatedById', type: 'varchar', length: '36', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'parentId', type: 'varchar', length: '36', isNullable: true }));

    const refreshedTable = await queryRunner.getTable('conversations');
    if (!refreshedTable) {
      return;
    }

    const ensureIndex = async (index: TableIndex) => {
      const hasIndex = refreshedTable.indices.some((item) => item.name === index.name);
      if (!hasIndex) {
        await queryRunner.createIndex('conversations', index);
      }
    };

    await ensureIndex(
      new TableIndex({
        name: 'conversations-labo-answered-created-idx',
        columnNames: ['laboId', 'isAnswered', 'createdAt'],
      })
    );

    await ensureIndex(
      new TableIndex({
        name: 'conversations-course-labo-idx',
        columnNames: ['courseId', 'laboId'],
      })
    );

    await ensureIndex(
      new TableIndex({
        name: 'conversations-parent-idx',
        columnNames: ['parentId'],
      })
    );

    const ensureForeignKey = async (foreignKey: TableForeignKey) => {
      const hasForeignKey = refreshedTable.foreignKeys.some((item) => item.name === foreignKey.name);
      if (!hasForeignKey) {
        await queryRunner.createForeignKey('conversations', foreignKey);
      }
    };

    await ensureForeignKey(
      new TableForeignKey({
        name: 'FK_conversations_labo_id',
        columnNames: ['laboId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );

    await ensureForeignKey(
      new TableForeignKey({
        name: 'FK_conversations_moderated_by_id',
        columnNames: ['moderatedById'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );

    await ensureForeignKey(
      new TableForeignKey({
        name: 'FK_conversations_parent_id',
        columnNames: ['parentId'],
        referencedTableName: 'conversations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('conversations');
    if (!table) {
      return;
    }

    const dropForeignKeyIfExists = async (name: string) => {
      const refreshedTable = await queryRunner.getTable('conversations');
      const foreignKey = refreshedTable?.foreignKeys.find((item) => item.name === name);
      if (foreignKey) {
        await queryRunner.dropForeignKey('conversations', foreignKey);
      }
    };

    const dropIndexIfExists = async (name: string) => {
      const refreshedTable = await queryRunner.getTable('conversations');
      const index = refreshedTable?.indices.find((item) => item.name === name);
      if (index) {
        await queryRunner.dropIndex('conversations', index);
      }
    };

    await dropForeignKeyIfExists('FK_conversations_parent_id');
    await dropForeignKeyIfExists('FK_conversations_moderated_by_id');
    await dropForeignKeyIfExists('FK_conversations_labo_id');

    await dropIndexIfExists('conversations-parent-idx');
    await dropIndexIfExists('conversations-course-labo-idx');
    await dropIndexIfExists('conversations-labo-answered-created-idx');

    const columns = [
      'parentId',
      'moderatedById',
      'laboId',
      'pharmacistAlias',
      'moderatedAt',
      'answeredAt',
      'isDeleted',
      'isHidden',
      'visibility',
      'isAnswered',
    ];

    for (const columnName of columns) {
      const hasColumn = await queryRunner.hasColumn('conversations', columnName);
      if (hasColumn) {
        await queryRunner.dropColumn('conversations', columnName);
      }
    }
  }
}
