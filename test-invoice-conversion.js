const db = require('./database/db');

async function testInvoiceConversion() {
  try {
    console.log('=== TESTING INVOICE CONVERSION SETUP ===\n');
    
    // Check if we have any draft orders to test with
    console.log('1. Checking for draft orders (my_status = 0):');
    const [draftOrders] = await db.query(`
      SELECT id, client_id, total_amount, status, my_status 
      FROM sales_orders 
      WHERE my_status = 0 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    if (draftOrders.length === 0) {
      console.log('❌ No draft orders found! You need orders with my_status = 0 to test invoice conversion.');
      console.log('Create some sales orders first, or check if existing orders have different my_status values.');
      
      // Show all orders to see what we have
      const [allOrders] = await db.query(`
        SELECT id, client_id, total_amount, status, my_status 
        FROM sales_orders 
        ORDER BY id DESC 
        LIMIT 10
      `);
      console.log('\nAll orders in system:');
      console.table(allOrders);
    } else {
      console.log(`✅ Found ${draftOrders.length} draft orders:`);
      console.table(draftOrders);
      
      // Check if the clients exist
      console.log('\n2. Checking if clients exist for these orders:');
      for (const order of draftOrders) {
        const [client] = await db.query(
          'SELECT id, name, COALESCE(balance, 0) as balance FROM Clients WHERE id = ?',
          [order.client_id]
        );
        
        if (client.length > 0) {
          console.log(`✅ Client ${order.client_id}: ${client[0].name} (current balance: ${client[0].balance})`);
        } else {
          console.log(`❌ Client ${order.client_id}: NOT FOUND in Clients table`);
        }
      }
    }
    
    // Check if client_ledger table exists
    console.log('\n3. Checking client_ledger table:');
    try {
      const [ledgerCheck] = await db.query('SELECT COUNT(*) as count FROM client_ledger');
      console.log(`✅ client_ledger table exists with ${ledgerCheck[0].count} records`);
    } catch (error) {
      console.log('❌ client_ledger table does not exist:', error.message);
    }
    
    // Check if Clients table has balance column
    console.log('\n4. Checking Clients table structure:');
    try {
      const [columns] = await db.query('DESCRIBE Clients');
      const balanceColumn = columns.find(col => col.Field === 'balance');
      if (balanceColumn) {
        console.log('✅ balance column found in Clients table');
      } else {
        console.log('❌ balance column NOT found in Clients table');
      }
    } catch (error) {
      console.log('❌ Error checking Clients table structure:', error.message);
    }
    
    // Check chart of accounts
    console.log('\n5. Checking chart of accounts:');
    const [accounts] = await db.query(`
      SELECT id, account_code, account_name, account_type, is_active 
      FROM chart_of_accounts 
      WHERE account_type IN (2, 4) 
      ORDER BY account_type, account_code
    `);
    
    if (accounts.length === 0) {
      console.log('❌ No required chart of accounts found!');
      console.log('You need accounts with account_type = 2 (receivables) and account_type = 4 (revenue)');
    } else {
      console.log(`✅ Found ${accounts.length} required accounts:`);
      console.table(accounts);
    }
    
    console.log('\n=== TEST COMPLETE ===');
    console.log('\nTo test invoice conversion:');
    console.log('1. Make sure you have draft orders (my_status = 0)');
    console.log('2. Ensure the required chart of accounts exist');
    console.log('3. Go to Customer Orders page and click "Convert to Invoice"');
    console.log('4. Check the server console for detailed logging');
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing invoice conversion setup:', error);
    process.exit(1);
  }
}

testInvoiceConversion();
