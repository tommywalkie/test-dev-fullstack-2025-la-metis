import "reflect-metadata";
import { DataSource } from "typeorm";

export const isTypeORMCLI = process.argv.find((arg) => arg.includes("typeorm"));

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DATABASE_URL || "db.sqlite3",
  entities: [`./src/**/*.entity.ts`],
  migrations: [`./src/migrations/*.ts`],
  migrationsRun: true,
  logging: true,
});

let db: DataSource;

export async function initializeDatabase(): Promise<void> {
  db = await AppDataSource.initialize();
}
