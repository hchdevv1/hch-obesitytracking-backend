import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBaselineDateToObesityRegister1787615535267 implements MigrationInterface {
    name = 'AddBaselineDateToObesityRegister1787615535267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" ADD "baseline_date" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" DROP COLUMN "baseline_date"`);
    }

}
