import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotifications1766782000000 implements MigrationInterface {
    name = 'CreateNotifications1766782000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create notifications table if not exists
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "type" character varying NOT NULL,
                "title" character varying(255) NOT NULL,
                "message" text NOT NULL,
                "read" boolean NOT NULL DEFAULT false,
                "pinned" boolean NOT NULL DEFAULT false,
                "priority" character varying NOT NULL DEFAULT 'medium',
                "category" character varying(100) NOT NULL,
                "action_url" character varying(500),
                "metadata" jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
            )
        `);

        // 2. Add foreign key constraint if not exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_notifications_user') THEN 
                    ALTER TABLE "notifications" 
                    ADD CONSTRAINT "FK_notifications_user" 
                    FOREIGN KEY ("user_id") 
                    REFERENCES "users"("id") 
                    ON DELETE CASCADE 
                    ON UPDATE NO ACTION; 
                END IF; 
            END $$;
        `);

        // 3. Create index on user_id and created_at for efficient querying
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_notifications_user_created" 
            ON "notifications" ("user_id", "created_at" DESC)
        `);

        // 4. Create index on user_id and read for filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_notifications_user_read" 
            ON "notifications" ("user_id", "read")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user_read"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user_created"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_notifications_user"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    }
}
