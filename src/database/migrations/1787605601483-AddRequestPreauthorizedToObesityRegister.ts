import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRequestPreauthorizedToObesityRegister1787605601483 implements MigrationInterface {
    name = 'AddRequestPreauthorizedToObesityRegister1787605601483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" ADD "is_request_preauthorized" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" DROP COLUMN "is_request_preauthorized"`);
    }

}
