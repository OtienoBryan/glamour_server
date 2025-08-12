const db = require('./database/db');

async function debugClient23() {
  try {
    console.log('=== DEBUGGING CLIENT 23 BALANCE ISSUE ===\n');

    // Check client 23 details
    console.log('1. Client 23 details:');
    const [client23] = await db.query('SELECT * FROM Clients WHERE id = 23');
    if (client23.length === 0) {
      console.log('❌ Client 23 not found!');
      return;
    }
    console.table(client23);

    // Check all orders for client 23
    console.log('\n2. All orders for client 23:');
    const [orders] = await db.query(`
      SELECT id, client_id, total_amount, my_status, status, order_date
      FROM sales_orders
      WHERE client_id = 23
      ORDER BY id ASC
    `);
    console.table(orders);

    // Check client_ledger for client 23
    console.log('\n3. Client ledger entries for client 23:');
    const [ledger] = await db.query(`
      SELECT * FROM client_ledger
      WHERE client_id = 23
      ORDER BY id ASC
    `);
    console.table(ledger);

    // Calculate expected balance
    console.log('\n4. Balance calculation:');
    const totalOrders = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    console.log('Total orders amount:', totalOrders);
    console.log('Current balance in Clients table:', client23[0].balance || 0);
    console.log('Expected balance should be:', totalOrders);

    // Check if we can manually update the balance
    console.log('\n5. Testing manual balance update:');
    const newBalance = totalOrders;
    console.log('Setting balance to:', newBalance);
    
    const [updateResult] = await db.query(
      'UPDATE Clients SET balance = ? WHERE id = ?',
      [newBalance, 23]
    );
    console.log('Update result - rows affected:', updateResult.affectedRows);
    
    // Verify the update
    const [verifyResult] = await db.query(
      'SELECT balance FROM Clients WHERE id = 23'
    );
    const updatedBalance = verifyResult.length > 0 ? parseFloat(verifyResult[0].balance) : 0;
    console.log('✅ Balance updated successfully to:', updatedBalance);

    console.log('\n=== DEBUG COMPLETE ===');
    process.exit(0);
  } catch (error) {
    console.error('Error debugging client 23:', error);
    process.exit(1);
  }
}

debugClient23();
