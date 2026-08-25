import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuccessStatusToObesityRegister1787560898986 implements MigrationInterface {
    name = 'AddSuccessStatusToObesityRegister1787560898986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" RENAME COLUMN "success" TO "is_success"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" RENAME COLUMN "is_success" TO "success"`);
    }

}
