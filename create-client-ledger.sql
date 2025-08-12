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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_client_ledger_client_id ON client_ledger(client_id);
CREATE INDEX IF NOT EXISTS idx_client_ledger_date ON client_ledger(date);
CREATE INDEX IF NOT EXISTS idx_client_ledger_reference ON client_ledger(reference_type, reference_id);
