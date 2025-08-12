const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupUpliftSaleItemsTable() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'glamour_queen'
    });

    console.log('✅ Connected to database successfully');

    // Read and execute the schema file
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(__dirname, 'database', 'uplift_sale_items_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅ Executed statement successfully');
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('ℹ️  Table already exists, skipping creation');
          } else {
            console.error('❌ Error executing statement:', error.message);
          }
        }
      }
    }

    // Check if table exists and has data
    const [tables] = await connection.execute('SHOW TABLES LIKE "UpliftSaleItem"');
    if (tables.length > 0) {
      console.log('✅ UpliftSaleItem table exists');
      
      // Check if table has data
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM UpliftSaleItem');
      console.log(`📊 UpliftSaleItem table has ${rows[0].count} records`);
      
      if (rows[0].count === 0) {
        console.log('ℹ️  Table is empty, you may want to add sample data');
      }
    } else {
      console.log('❌ UpliftSaleItem table was not created');
    }

    console.log('🎉 UpliftSaleItem table setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up UpliftSaleItem table:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupUpliftSaleItemsTable();
