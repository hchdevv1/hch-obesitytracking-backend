import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHnToObesityWeightTransaction1785816424675 implements MigrationInterface {
    name = 'AddHnToObesityWeightTransaction1785816424675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_weight_transaction" ADD "hn" character varying(20) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_obesity_weight_transaction_hn" ON "obesity_weight_transaction" ("hn") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_obesity_weight_transaction_hn"`);
        await queryRunner.query(`ALTER TABLE "obesity_weight_transaction" DROP COLUMN "hn"`);
    }

}
