import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateObesityWeightTransaction1785432132086 implements MigrationInterface {
    name = 'CreateObesityWeightTransaction1785432132086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "obesity_weight_transaction" ("transaction_id" BIGSERIAL NOT NULL, "register_id" bigint NOT NULL, "patient_id" bigint NOT NULL, "episode_id" bigint NOT NULL, "vn" character varying(20), "height" numeric(5,2) NOT NULL, "weight" numeric(5,2) NOT NULL, "bmi" numeric(5,2) NOT NULL, "weight_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_weight_at_hospital" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "pk_obesity_weight_transaction" PRIMARY KEY ("transaction_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_obesity_weight_transaction_register_weight_at" ON "obesity_weight_transaction" ("register_id", "weight_at") `);
        await queryRunner.query(`CREATE INDEX "idx_obesity_weight_transaction_weight_at" ON "obesity_weight_transaction" ("weight_at") `);
        await queryRunner.query(`CREATE INDEX "idx_obesity_weight_transaction_patient_id" ON "obesity_weight_transaction" ("patient_id") `);
        await queryRunner.query(`ALTER TABLE "obesity_weight_transaction" ADD CONSTRAINT "fk_obesity_weight_transaction_register" FOREIGN KEY ("register_id") REFERENCES "obesity_register"("register_id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_weight_transaction" DROP CONSTRAINT "fk_obesity_weight_transaction_register"`);
        await queryRunner.query(`DROP INDEX "public"."idx_obesity_weight_transaction_patient_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_obesity_weight_transaction_weight_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_obesity_weight_transaction_register_weight_at"`);
        await queryRunner.query(`DROP TABLE "obesity_weight_transaction"`);
    }

}
