import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";

const dbPath = path.join(__dirname, "generated", "guitar-academy.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${dbPath}`,
  },
});
