import "reflect-metadata";
import { DataSource } from "typeorm";

export const isTypeORMCLI = process.argv.find((arg) => arg.includes("typeorm"));
export const isTest = process.env.NODE_ENV === "test";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DATABASE_URL || "db.sqlite3",
  entities: [`./src/**/*.entity.ts`],
  migrations: [`./src/migrations/*.ts`],
  migrationsRun: !isTest, // Don't run migrations in test environment
  synchronize: isTest, // Auto-create schema in test environment
  logging: process.env.LOG_LEVEL === "debug",
});

let db: DataSource;

export async function initializeDatabase(): Promise<void> {
  db = await AppDataSource.initialize();
}
