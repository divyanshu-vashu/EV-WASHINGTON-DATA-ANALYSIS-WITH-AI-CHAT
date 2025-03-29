
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://admin:admin@localhost:5431/appointy"
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);
  }
});

export default pool;
