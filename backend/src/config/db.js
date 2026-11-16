import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const testConnection = async () => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );

    console.log("Database connected:", result.rows[0].database);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

export default pool;