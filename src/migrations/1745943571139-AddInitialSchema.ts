import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInitialSchema1745943571139 implements MigrationInterface {
  name = "AddInitialSchema1745943571139";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_analysis" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "projectId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_analysis"("id", "name", "projectId", "createdAt", "updatedAt") SELECT "id", "name", "projectId", "createdAt", "updatedAt" FROM "analysis"`
    );
    await queryRunner.query(`DROP TABLE "analysis"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_analysis" RENAME TO "analysis"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_analysis" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "projectId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_0c55929c37d981ded07299eacbb" FOREIGN KEY ("projectId") REFERENCES "project" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_analysis"("id", "name", "projectId", "createdAt", "updatedAt") SELECT "id", "name", "projectId", "createdAt", "updatedAt" FROM "analysis"`
    );
    await queryRunner.query(`DROP TABLE "analysis"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_analysis" RENAME TO "analysis"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analysis" RENAME TO "temporary_analysis"`
    );
    await queryRunner.query(
      `CREATE TABLE "analysis" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "projectId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`
    );
    await queryRunner.query(
      `INSERT INTO "analysis"("id", "name", "projectId", "createdAt", "updatedAt") SELECT "id", "name", "projectId", "createdAt", "updatedAt" FROM "temporary_analysis"`
    );
    await queryRunner.query(`DROP TABLE "temporary_analysis"`);
    await queryRunner.query(
      `ALTER TABLE "analysis" RENAME TO "temporary_analysis"`
    );
    await queryRunner.query(
      `CREATE TABLE "analysis" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "projectId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_0c55929c37d981ded07299eacbb" FOREIGN KEY ("projectId") REFERENCES "project" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "analysis"("id", "name", "projectId", "createdAt", "updatedAt") SELECT "id", "name", "projectId", "createdAt", "updatedAt" FROM "temporary_analysis"`
    );
    await queryRunner.query(`DROP TABLE "temporary_analysis"`);
  }
}
