const db = require('./database/db');
const fs = require('fs');
const path = require('path');

async function setupClientStockTable() {
  try {
    console.log('Setting up ClientStock table...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'create_ClientStock_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await db.query(statement);
      }
    }
    
    console.log('✅ ClientStock table created successfully!');
    
    // Insert some sample data
    console.log('Inserting sample data...');
    const sampleData = [
      { quantity: 10, clientId: 1, productId: 1, salesrepId: 1 },
      { quantity: 5, clientId: 1, productId: 2, salesrepId: 1 },
      { quantity: 15, clientId: 2, productId: 1, salesrepId: 2 },
      { quantity: 8, clientId: 2, productId: 3, salesrepId: 2 }
    ];
    
    for (const data of sampleData) {
      try {
        await db.query(
          'INSERT INTO ClientStock (quantity, clientId, productId, salesrepId) VALUES (?, ?, ?, ?)',
          [data.quantity, data.clientId, data.productId, data.salesrepId]
        );
        console.log(`✅ Inserted sample data for client ${data.clientId}, product ${data.productId}`);
      } catch (insertError) {
        if (insertError.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Sample data already exists for client ${data.clientId}, product ${data.productId}`);
        } else {
          console.log(`⚠️ Could not insert sample data for client ${data.clientId}, product ${data.productId}:`, insertError.message);
        }
      }
    }
    
    console.log('✅ ClientStock table setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up ClientStock table:', error);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('💡 Hint: One of the referenced tables (Clients, products, or SalesRep) might not exist.');
      console.log('Please ensure these tables exist before creating the ClientStock table.');
    }
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupClientStockTable();
