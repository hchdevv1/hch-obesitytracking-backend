import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusFlagsToObesityRegister1787535161578 implements MigrationInterface {
    name = 'AddStatusFlagsToObesityRegister1787535161578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" ADD "is_cancelled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "obesity_register" ADD "is_preauthorized" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "obesity_register" ADD "is_operation_scheduled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "obesity_register" ADD "is_baseline_accepted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" DROP COLUMN "is_baseline_accepted"`);
        await queryRunner.query(`ALTER TABLE "obesity_register" DROP COLUMN "is_operation_scheduled"`);
        await queryRunner.query(`ALTER TABLE "obesity_register" DROP COLUMN "is_preauthorized"`);
        await queryRunner.query(`ALTER TABLE "obesity_register" DROP COLUMN "is_cancelled"`);
    }

}
