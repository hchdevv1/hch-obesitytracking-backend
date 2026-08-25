import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuccessToObesityRegister1787560585748 implements MigrationInterface {
    name = 'AddSuccessToObesityRegister1787560585748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" ADD "success" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "obesity_register" ADD "success_date" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" DROP COLUMN "success_date"`);
        await queryRunner.query(`ALTER TABLE "obesity_register" DROP COLUMN "success"`);
    }

}
