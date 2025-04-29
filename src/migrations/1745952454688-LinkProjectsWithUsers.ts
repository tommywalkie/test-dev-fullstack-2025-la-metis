import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkProjectsWithUsers1745952454688 implements MigrationInterface {
  name = "LinkProjectsWithUsers1745952454688";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer NOT NULL, "projectId" integer NOT NULL, CONSTRAINT "UQ_20543d6caa7324ce6706fad2f58" UNIQUE ("userId", "projectId"))`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_project" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdById" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_project"("id", "name", "createdAt", "updatedAt") SELECT "id", "name", "createdAt", "updatedAt" FROM "project"`
    );
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_project" RENAME TO "project"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_project" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdById" integer, CONSTRAINT "FK_678acfe7017fe8a25fe7cae5f18" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_project"("id", "name", "createdAt", "updatedAt", "createdById") SELECT "id", "name", "createdAt", "updatedAt", "createdById" FROM "project"`
    );
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_project" RENAME TO "project"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_project_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer NOT NULL, "projectId" integer NOT NULL, CONSTRAINT "UQ_20543d6caa7324ce6706fad2f58" UNIQUE ("userId", "projectId"), CONSTRAINT "FK_8d75193a81f827ba8d58575e637" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_be4e7ad73afd703f94b8866eb6b" FOREIGN KEY ("projectId") REFERENCES "project" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_project_user"("id", "createdAt", "updatedAt", "userId", "projectId") SELECT "id", "createdAt", "updatedAt", "userId", "projectId" FROM "project_user"`
    );
    await queryRunner.query(`DROP TABLE "project_user"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_project_user" RENAME TO "project_user"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_user" RENAME TO "temporary_project_user"`
    );
    await queryRunner.query(
      `CREATE TABLE "project_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer NOT NULL, "projectId" integer NOT NULL, CONSTRAINT "UQ_20543d6caa7324ce6706fad2f58" UNIQUE ("userId", "projectId"))`
    );
    await queryRunner.query(
      `INSERT INTO "project_user"("id", "createdAt", "updatedAt", "userId", "projectId") SELECT "id", "createdAt", "updatedAt", "userId", "projectId" FROM "temporary_project_user"`
    );
    await queryRunner.query(`DROP TABLE "temporary_project_user"`);
    await queryRunner.query(
      `ALTER TABLE "project" RENAME TO "temporary_project"`
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "createdById" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "project"("id", "name", "createdAt", "updatedAt", "createdById") SELECT "id", "name", "createdAt", "updatedAt", "createdById" FROM "temporary_project"`
    );
    await queryRunner.query(`DROP TABLE "temporary_project"`);
    await queryRunner.query(
      `ALTER TABLE "project" RENAME TO "temporary_project"`
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`
    );
    await queryRunner.query(
      `INSERT INTO "project"("id", "name", "createdAt", "updatedAt") SELECT "id", "name", "createdAt", "updatedAt" FROM "temporary_project"`
    );
    await queryRunner.query(`DROP TABLE "temporary_project"`);
    await queryRunner.query(`DROP TABLE "project_user"`);
  }
}
