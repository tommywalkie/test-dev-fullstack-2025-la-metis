import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserSchema1745948076643 implements MigrationInterface {
  name = "AddUserSchema1745948076643";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "role" varchar CHECK( "role" IN ('admin','manager','reader') ) NOT NULL DEFAULT ('reader'), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
