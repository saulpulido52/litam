import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommissionPercentageToSubscriptionPlans1703640000000 implements MigrationInterface {
    name = 'AddCommissionPercentageToSubscriptionPlans1703640000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "subscription_plans" ADD "commission_percentage" numeric(5,2)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "subscription_plans" DROP COLUMN "commission_percentage"`
        );
    }
}
