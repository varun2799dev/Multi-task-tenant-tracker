const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.on("connect", () => {
  console.log("✅ Connected to Supabase PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
