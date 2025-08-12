const db = require('./database/db');

async function testClientsTable() {
  try {
    console.log('=== TESTING CLIENTS TABLE ===\n');
    
    // Check table structure
    console.log('1. Checking Clients table structure:');
    const [columns] = await db.query('DESCRIBE Clients');
    console.table(columns);
    
    // Check if balance column exists
    const balanceColumn = columns.find(col => col.Field === 'balance');
    if (balanceColumn) {
      console.log('\n✅ Balance column found:', balanceColumn);
    } else {
      console.log('\n❌ Balance column NOT found!');
      console.log('You need to add the balance column to the Clients table.');
    }
    
    // Check sample data
    console.log('\n2. Checking sample client data:');
    const [clients] = await db.query('SELECT id, name, COALESCE(balance, 0) as balance FROM Clients LIMIT 5');
    console.table(clients);
    
    // Check if there are any sales orders
    console.log('\n3. Checking sales orders:');
    const [orders] = await db.query(`
      SELECT id, client_id, total_amount, my_status, status 
      FROM sales_orders 
      ORDER BY id DESC 
      LIMIT 5
    `);
    console.table(orders);
    
    // Check if client_ledger table exists
    console.log('\n4. Checking if client_ledger table exists:');
    try {
      const [ledgerCheck] = await db.query('SELECT COUNT(*) as count FROM client_ledger');
      console.log('✅ client_ledger table exists with', ledgerCheck[0].count, 'records');
    } catch (error) {
      console.log('❌ client_ledger table does not exist:', error.message);
      console.log('Run the create-client-ledger.sql script to create it.');
    }
    
    // Check chart of accounts
    console.log('\n5. Checking chart of accounts:');
    const [accounts] = await db.query(`
      SELECT id, account_code, account_name, account_type, is_active 
      FROM chart_of_accounts 
      WHERE account_type IN (2, 4) 
      ORDER BY account_type, account_code
    `);
    console.table(accounts);
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing Clients table:', error);
    process.exit(1);
  }
}

testClientsTable();
