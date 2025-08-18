-- Create ClientStock table
CREATE TABLE IF NOT EXISTS ClientStock (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    quantity INT(11) NOT NULL,
    clientId INT(11) NOT NULL,
    productId INT(11) NOT NULL,
    salesrepId INT(11) NOT NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (clientId) REFERENCES Clients(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (salesrepId) REFERENCES SalesRep(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_clientId (clientId),
    INDEX idx_productId (productId),
    INDEX idx_salesrepId (salesrepId),
    INDEX idx_client_product (clientId, productId),
    
    -- Unique constraint to prevent duplicate stock entries for same client and product
    UNIQUE KEY unique_client_product (clientId, productId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample data (optional)
-- INSERT INTO ClientStock (quantity, clientId, productId, salesrepId) VALUES
-- (10, 1, 1, 1),
-- (5, 1, 2, 1),
-- (15, 2, 1, 2),
-- (8, 2, 3, 2);
