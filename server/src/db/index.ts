import pool from './sql/index.js';
import { seedSqlDatabase } from './seeder.js';



const DbConnectionSql = async () => {
  const connection = await pool.getConnection();
  try {
    console.log("Database connection established successfully.");
    const seeded = await seedSqlDatabase(connection);
    if (seeded) {
      console.log('SQL database seeded successfully.');
    }
    return seeded;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error; // Rethrow the error after logging it
  } finally {
    connection.release();
  }
};

export default DbConnectionSql;



