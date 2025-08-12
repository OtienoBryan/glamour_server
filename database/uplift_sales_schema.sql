-- Uplift Sales Database Schema

-- Create UpliftSale table
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
);

-- Insert sample data (optional)
INSERT INTO UpliftSale (clientId, userId, status, totalAmount) VALUES
(1, 1, 'pending', 1500.00),
(2, 1, 'completed', 2300.50),
(3, 2, 'pending', 800.25),
(1, 2, 'completed', 1200.75),
(4, 1, 'cancelled', 950.00);

-- Add comments for documentation
ALTER TABLE UpliftSale COMMENT = 'Table to store uplift sales data with client and user relationships';
