const db = require('./database/db');

async function testBalanceUpdate() {
  try {
    console.log('=== TESTING BALANCE UPDATE PROCESS ===\n');

    // Check Clients table structure
    console.log('1. Checking Clients table structure:');
    const [columns] = await db.query('DESCRIBE Clients');
    console.table(columns);

    // Check if balance column exists
    const balanceColumn = columns.find(col => col.Field === 'balance');
    if (balanceColumn) {
      console.log('\n✅ Balance column found:', balanceColumn);
    } else {
      console.log('\n❌ Balance column NOT found!');
      console.log('Adding balance column...');
      await db.query('ALTER TABLE Clients ADD COLUMN balance DECIMAL(15,2) DEFAULT 0');
      console.log('✅ Balance column added');
    }

    // Check sample clients
    console.log('\n2. Checking sample clients:');
    const [clients] = await db.query('SELECT id, name, COALESCE(balance, 0) as balance FROM Clients LIMIT 5');
    console.table(clients);

    // Check if there are any confirmed orders
    console.log('\n3. Checking confirmed orders:');
    const [orders] = await db.query(`
      SELECT id, client_id, total_amount, my_status, status
      FROM sales_orders
      WHERE my_status = 1 OR status = 'confirmed'
      ORDER BY id DESC
      LIMIT 5
    `);
    console.table(orders);

    // Test a specific client update
    if (clients.length > 0) {
      const testClient = clients[0];
      console.log(`\n4. Testing balance update for client ${testClient.id} (${testClient.name}):`);
      console.log('Current balance:', testClient.balance);
      
      const newBalance = parseFloat(testClient.balance) + 100.00;
      console.log('Setting new balance to:', newBalance);
      
      const [updateResult] = await db.query(
        'UPDATE Clients SET balance = ? WHERE id = ?',
        [newBalance, testClient.id]
      );
      console.log('Update result - rows affected:', updateResult.affectedRows);
      
      // Verify the update
      const [verifyResult] = await db.query(
        'SELECT balance FROM Clients WHERE id = ?',
        [testClient.id]
      );
      const updatedBalance = verifyResult.length > 0 ? parseFloat(verifyResult[0].balance) : 0;
      console.log('✅ Balance updated successfully to:', updatedBalance);
      
      // Reset to original balance
      await db.query(
        'UPDATE Clients SET balance = ? WHERE id = ?',
        [testClient.balance, testClient.id]
      );
      console.log('🔄 Balance reset to original value');
    }

    // Check client_ledger table
    console.log('\n5. Checking client_ledger table:');
    try {
      const [ledgerCheck] = await db.query('SELECT COUNT(*) as count FROM client_ledger');
      console.log('✅ client_ledger table exists with', ledgerCheck[0].count, 'records');
      
      if (ledgerCheck[0].count > 0) {
        const [ledgerEntries] = await db.query('SELECT * FROM client_ledger ORDER BY id DESC LIMIT 3');
        console.log('Recent ledger entries:');
        console.table(ledgerEntries);
      }
    } catch (error) {
      console.log('❌ client_ledger table does not exist:', error.message);
    }

    console.log('\n=== TEST COMPLETE ===');
    process.exit(0);
  } catch (error) {
    console.error('Error testing balance update:', error);
    process.exit(1);
  }
}

testBalanceUpdate();
