const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "db.knhqntosioaaasopmtes.supabase.co",
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Supabase2799",
  port: process.env.DB_PORT || 5432,
  ssl: false,
});

// Test connection
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connection test successful");

    const result = await client.query("SELECT version()");
    console.log("PostgreSQL Version:", result.rows[0].version);

    client.release();
  } catch (err) {
    console.error("❌ Database connection test failed:", err.message);
  }
})();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
