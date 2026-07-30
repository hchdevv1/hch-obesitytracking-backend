import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateObesityRegister1785430313991 implements MigrationInterface {
    name = 'CreateObesityRegister1785430313991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "obesity_register" ("register_id" BIGSERIAL NOT NULL, "patient_id" bigint NOT NULL, "obesity_number" character varying(30) NOT NULL, "user_id" character varying(100) NOT NULL, "hn" character varying(20) NOT NULL, "fullname" character varying(200) NOT NULL, "gender" character(1) NOT NULL, "dob" date NOT NULL, "baseline_height" numeric(5,2) NOT NULL, "baseline_weight" numeric(5,2) NOT NULL, "baseline_bmi" numeric(5,2) NOT NULL, "surgery_status" character varying(20) NOT NULL DEFAULT 'PENDING', "surgery_approved_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "pk_obesity_register" PRIMARY KEY ("register_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_obesity_register_user_id" ON "obesity_register" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_obesity_register_obesity_number" ON "obesity_register" ("obesity_number") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_obesity_register_patient_id" ON "obesity_register" ("patient_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_obesity_register_patient_id"`);
        await queryRunner.query(`DROP INDEX "public"."uq_obesity_register_obesity_number"`);
        await queryRunner.query(`DROP INDEX "public"."uq_obesity_register_user_id"`);
        await queryRunner.query(`DROP TABLE "obesity_register"`);
    }

}
