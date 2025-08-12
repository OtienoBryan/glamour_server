-- Uplift Sale Items Database Schema

-- Create UpliftSaleItem table
CREATE TABLE IF NOT EXISTS UpliftSaleItem (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    upliftSaleId INT(11) NOT NULL,
    productId INT(11) NOT NULL,
    quantity INT(11) NOT NULL,
    unitPrice DOUBLE NOT NULL,
    total DOUBLE NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    -- Add foreign key constraints
    FOREIGN KEY (upliftSaleId) REFERENCES UpliftSale(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Add indexes for better performance
    INDEX idx_upliftSaleId (upliftSaleId),
    INDEX idx_productId (productId),
    INDEX idx_createdAt (createdAt)
);

-- Insert sample data (optional)
INSERT INTO UpliftSaleItem (upliftSaleId, productId, quantity, unitPrice, total) VALUES
(1, 1, 2, 150.00, 300.00),
(1, 2, 1, 200.00, 200.00),
(2, 1, 3, 150.00, 450.00),
(3, 3, 1, 100.00, 100.00),
(4, 2, 2, 200.00, 400.00);

-- Add comments for documentation
ALTER TABLE UpliftSaleItem COMMENT = 'Table to store individual items within uplift sales';
