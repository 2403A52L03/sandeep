
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import env from "../src/config/env.js";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  const pool = new Pool({
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    database: env.DB.database
  });

  try {
    console.log("[Init] Connecting to PostgreSQL...");
    
    await pool.query("SELECT 1");
    console.log("[Init] Database connection successful.");

    const schemaSql = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );

    const seedSql = fs.readFileSync(
      path.join(__dirname, "seed.sql"),
      "utf8"
    );

    console.log("[Init] Executing schema.sql...");
    await pool.query(schemaSql);
    console.log("[Init] Schema created successfully.");

    console.log("[Init] Executing seed.sql...");
    await pool.query(seedSql);
    console.log("[Init] Demo data loaded successfully.");

    console.log("[Init] Database initialization complete.");
  } catch (error) {
    console.error("[Init] Database initialization failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
