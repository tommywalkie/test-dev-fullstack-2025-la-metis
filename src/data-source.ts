import "reflect-metadata";
import { DataSource } from "typeorm";

export const isTypeORMCLI = process.argv.find((arg) => arg.includes("typeorm"));
export const isTestEnvironment = process.env.NODE_ENV === "test";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: isTestEnvironment
    ? ":memory:"
    : process.env.DATABASE_URL || "db.sqlite3",
  entities: [`./src/**/*.entity.ts`],
  migrations: [`./src/migrations/*.ts`],
  migrationsRun: !isTestEnvironment, // Don't run migrations in test environment
  synchronize: isTestEnvironment, // Auto-create schema in test environment
  logging: false,
});

let db: DataSource;

export async function initializeDatabase(): Promise<void> {
  db = await AppDataSource.initialize();
}
