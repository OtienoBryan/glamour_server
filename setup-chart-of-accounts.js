const db = require('./database/db');

async function setupChartOfAccounts() {
  try {
    console.log('=== SETTING UP CHART OF ACCOUNTS ===\n');
    
    // Check if accounts already exist
    const [existingAccounts] = await db.query('SELECT id, account_code, account_name, account_type FROM chart_of_accounts');
    console.log('Existing accounts:', existingAccounts.length);
    
    if (existingAccounts.length > 0) {
      console.log('Chart of accounts already exists. Current accounts:');
      existingAccounts.forEach(acc => {
        console.log(`- ${acc.account_code}: ${acc.account_name} (type: ${acc.account_type})`);
      });
    }
    
    // Define required accounts for invoice conversion
    const requiredAccounts = [
      {
        account_code: '1100',
        account_name: 'Accounts Receivable',
        account_type: 2, // Liability/Receivable
        description: 'Amounts owed by customers for goods or services provided'
      },
      {
        account_code: '4000',
        account_name: 'Sales Revenue',
        account_type: 4, // Revenue
        description: 'Revenue from sales of goods or services'
      },
      {
        account_code: '2100',
        account_name: 'Sales Tax Payable',
        account_type: 2, // Liability
        description: 'Sales tax collected from customers and owed to government'
      }
    ];
    
    console.log('\nChecking for required accounts...');
    
    for (const account of requiredAccounts) {
      const [existing] = await db.query(
        'SELECT id FROM chart_of_accounts WHERE account_code = ?',
        [account.account_code]
      );
      
      if (existing.length === 0) {
        console.log(`Creating account: ${account.account_code} - ${account.account_name}`);
        await db.query(
          `INSERT INTO chart_of_accounts (account_code, account_name, account_type, description, is_active)
           VALUES (?, ?, ?, ?, 1)`,
          [account.account_code, account.account_name, account.account_type, account.description]
        );
        console.log(`✅ Created: ${account.account_code} - ${account.account_name}`);
      } else {
        console.log(`ℹ️  Account exists: ${account.account_code} - ${account.account_name}`);
      }
    }
    
    console.log('\n=== CHART OF ACCOUNTS SETUP COMPLETE ===');
    console.log('You can now convert orders to invoices with proper journal entries.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up chart of accounts:', error);
    process.exit(1);
  }
}

setupChartOfAccounts();
