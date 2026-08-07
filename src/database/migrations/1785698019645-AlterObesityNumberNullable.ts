import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterObesityNumberNullable1785698019645 implements MigrationInterface {
    name = 'AlterObesityNumberNullable1785698019645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" ALTER COLUMN "obesity_number" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obesity_register" ALTER COLUMN "obesity_number" SET NOT NULL`);
    }

}
