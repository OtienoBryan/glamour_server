# Invoice Conversion Setup Guide

This guide explains how to set up the invoice conversion functionality that changes `my_status` to 1 and creates journal entries when converting customer orders to invoices.

## Overview

When a customer order is converted to an invoice, the system will:
1. Change the order's `my_status` from 0 to 1 (approved)
2. Create proper journal entries for accounting
3. Update the client ledger (if the table exists)
4. Update the Clients table balance

## Prerequisites

Before using the invoice conversion functionality, you need to set up the required database tables and accounts.

### 1. Create Chart of Accounts

Run the setup script to create the required chart of accounts:

```bash
node setup-chart-of-accounts.js
```

This will create:
- **Accounts Receivable** (account_type = 2) - for tracking customer balances
- **Sales Revenue** (account_type = 4) - for recording sales income
- **Sales Tax Payable** (account_type = 2) - for tracking tax obligations

### 2. Create Client Ledger Table

Run the SQL script to create the client ledger table:

```bash
mysql -u your_username -p your_database < create-client-ledger.sql
```

Or execute the SQL directly in your database:

```sql
-- Create client_ledger table for tracking client account balances
CREATE TABLE IF NOT EXISTS client_ledger (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(20) NOT NULL,
    reference_id INT NOT NULL,
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    running_balance DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Clients(id)
);

-- Add balance column to Clients table if it doesn't exist
ALTER TABLE Clients ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0;
```

## How It Works

### 1. Order Status Flow

- **my_status = 0**: New order (draft)
- **my_status = 1**: Approved (converted to invoice)
- **my_status = 2**: In transit
- **my_status = 3**: Complete
- **my_status = 4**: Cancelled
- **my_status = 5**: Declined
- **my_status = 6**: Returned to stock

### 2. Journal Entry Creation

When converting to invoice, the system creates:

1. **Debit**: Accounts Receivable (increases customer balance)
2. **Credit**: Sales Revenue (records the sale)
3. **Credit**: Sales Tax Payable (if tax is applicable)

### 3. Client Ledger Update

The system tracks client balances in the `client_ledger` table:
- Each invoice creates a debit entry (increases receivable)
- Each payment creates a credit entry (decreases receivable)
- Running balance is maintained for each client

## Usage

### Frontend

In the Customer Orders page, admin users can click "Convert to Invoice" for orders with `my_status = 0` (draft status).

### Backend

The conversion is handled by the `convertToInvoice` endpoint:

```
POST /api/financial/sales-orders/:id/convert-to-invoice
```

## Testing

After setting up the required tables and accounts, you can test the setup:

```bash
# Test the Clients table structure and data
node test-clients-table.js

# Test the chart of accounts setup
node setup-chart-of-accounts.js

# Test the complete invoice conversion setup
node test-invoice-conversion.js
```

## Troubleshooting

### Common Issues

1. **"Required accounts not found" error**
   - Run `node setup-chart-of-accounts.js` to create the required accounts

2. **"client_ledger table doesn't exist" error**
   - Run the `create-client-ledger.sql` script

3. **Journal entries not created**
   - Check that the chart of accounts exists and is active
   - Verify account types are correct (2 for receivables, 4 for revenue)

4. **Balance not updating in Clients table**
   - Run `node test-clients-table.js` to check table structure
   - Verify the `balance` column exists in the Clients table
   - Check if the `client_ledger` table exists
   - Look for errors in the server console during conversion

### Debugging

The system provides detailed logging:
- Account lookup results
- Journal entry creation status
- Client ledger update status
- Any errors encountered

Check the server console for detailed information during invoice conversion.

## Database Schema

### Key Tables

- **sales_orders**: Main order table with `my_status` field
- **chart_of_accounts**: Chart of accounts for journal entries
- **journal_entries**: Header for journal entries
- **journal_entry_lines**: Individual journal entry lines
- **client_ledger**: Client account balance tracking
- **Clients**: Client information with balance field

### Key Fields

- **my_status**: Order approval status (0=draft, 1=approved, etc.)
- **account_type**: Chart of accounts type (1=asset, 2=liability, 4=revenue)
- **debit/credit**: Journal entry amounts
- **running_balance**: Client account balance tracking
