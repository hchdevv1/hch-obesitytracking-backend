import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateObesityWeightTransaction1785919088885
  implements MigrationInterface
{
  name = 'UpdateObesityWeightTransaction1785919088885';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."idx_obesity_weight_transaction_register_weight_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "obesity_weight_transaction"
      ADD "updated_at" TIMESTAMPTZ DEFAULT now()
    `);

    await queryRunner.query(`
      ALTER TABLE "obesity_weight_transaction"
      ALTER COLUMN "episode_id" DROP NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uk_obesity_weight_transaction_register_weight_at"
      ON "obesity_weight_transaction" ("register_id", "weight_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."uk_obesity_weight_transaction_register_weight_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "obesity_weight_transaction"
      ALTER COLUMN "episode_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "obesity_weight_transaction"
      DROP COLUMN "updated_at"
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_obesity_weight_transaction_register_weight_at"
      ON "obesity_weight_transaction" ("register_id", "weight_at")
    `);
  }
}
