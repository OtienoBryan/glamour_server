const db = require('./database/db');

async function setupUpliftSalesTable() {
  try {
    console.log('Setting up UpliftSale table...');
    
    // Create UpliftSale table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS UpliftSale (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        clientId INT(11) NOT NULL,
        userId INT(11) NOT NULL,
        status VARCHAR(191) NOT NULL DEFAULT 'pending',
        totalAmount DOUBLE NOT NULL DEFAULT 0,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        
        -- Add foreign key constraints
        FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        
        -- Add indexes for better performance
        INDEX idx_clientId (clientId),
        INDEX idx_userId (userId),
        INDEX idx_status (status),
        INDEX idx_createdAt (createdAt),
        INDEX idx_updatedAt (updatedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await db.execute(createTableQuery);
    console.log('✅ UpliftSale table created successfully');
    
    // Check if table exists and has data
    const [tables] = await db.execute('SHOW TABLES LIKE "UpliftSale"');
    if (tables.length > 0) {
      console.log('✅ UpliftSale table exists');
      
      // Check if table has data
      const [countResult] = await db.execute('SELECT COUNT(*) as count FROM UpliftSale');
      const count = countResult[0].count;
      console.log(`📊 UpliftSale table has ${count} records`);
      
      if (count === 0) {
        // Insert sample data
        const sampleDataQuery = `
          INSERT INTO UpliftSale (clientId, userId, status, totalAmount) VALUES
          (1, 1, 'pending', 1500.00),
          (2, 1, 'completed', 2300.50),
          (3, 2, 'pending', 800.25),
          (1, 2, 'completed', 1200.75),
          (4, 1, 'cancelled', 950.00)
        `;
        
        try {
          await db.execute(sampleDataQuery);
          console.log('✅ Sample data inserted successfully');
        } catch (error) {
          console.log('⚠️ Could not insert sample data (client or user IDs may not exist):', error.message);
        }
      }
    } else {
      console.log('❌ UpliftSale table was not created');
    }
    
    console.log('🎉 UpliftSales setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up UpliftSale table:', error);
  } finally {
    // Close database connection
    if (db.end) {
      await db.end();
    }
    process.exit(0);
  }
}

// Run the setup
setupUpliftSalesTable();
