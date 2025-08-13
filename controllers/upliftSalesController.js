const db = require('../database/db');

const upliftSalesController = {
  // Get all uplift sales with optional filters
  getAllUpliftSales: async (req, res) => {
    try {
      const { clientId, userId, status, startDate, endDate, page = 1, limit = 100 } = req.query;
      
      let query = `
        SELECT 
          us.*,
          c.name as clientName,
          u.name as userName,
          u.email as userEmail
        FROM UpliftSale us
        LEFT JOIN Clients c ON us.clientId = c.id
        LEFT JOIN SalesRep u ON us.userId = u.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (clientId) {
        query += ' AND us.clientId = ?';
        params.push(clientId);
      }
      
      if (userId) {
        query += ' AND us.userId = ?';
        params.push(userId);
      }
      
      if (status) {
        const s = String(status).trim().toLowerCase();
        if (s === '0' || s === 'void') {
          query += " AND (LOWER(us.status) = '0' OR us.status = 0 OR LOWER(us.status) = 'void' OR LOWER(us.status) = 'cancelled')";
        } else if (s === '1' || s === 'sale') {
          query += " AND (LOWER(us.status) = '1' OR us.status = 1 OR LOWER(us.status) = 'sale' OR LOWER(us.status) = 'completed')";
        } else {
          query += ' AND LOWER(us.status) = ?';
          params.push(s);
        }
      }
      
      if (startDate) {
        query += ' AND DATE(us.createdAt) >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND DATE(us.createdAt) <= ?';
        params.push(endDate);
      }
      
      // Add pagination
      const offset = (page - 1) * limit;
      query += ' ORDER BY us.createdAt DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [sales] = await db.execute(query, params);
      
      // Fetch UpliftSaleItems for each sale
      for (let sale of sales) {
        const itemsQuery = `
          SELECT 
            usi.*,
            p.product_name as productName,
            p.description as productDescription
          FROM UpliftSaleItem usi
          LEFT JOIN products p ON usi.productId = p.id
          WHERE usi.upliftSaleId = ?
        `;
        const [items] = await db.execute(itemsQuery, [sale.id]);
        sale.items = items;
      }
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM UpliftSale us
        WHERE 1=1
      `;
      
      const countParams = [];
      if (clientId) {
        countQuery += ' AND us.clientId = ?';
        countParams.push(clientId);
      }
      if (userId) {
        countQuery += ' AND us.userId = ?';
        countParams.push(userId);
      }
      if (status) {
        const s = String(status).trim().toLowerCase();
        if (s === '0' || s === 'void') {
          countQuery += " AND (LOWER(us.status) = '0' OR us.status = 0 OR LOWER(us.status) = 'void' OR LOWER(us.status) = 'cancelled')";
        } else if (s === '1' || s === 'sale') {
          countQuery += " AND (LOWER(us.status) = '1' OR us.status = 1 OR LOWER(us.status) = 'sale' OR LOWER(us.status) = 'completed')";
        } else {
          countQuery += ' AND LOWER(us.status) = ?';
          countParams.push(s);
        }
      }
      if (startDate) {
        countQuery += ' AND DATE(us.createdAt) >= ?';
        countParams.push(startDate);
      }
      if (endDate) {
        countQuery += ' AND DATE(us.createdAt) <= ?';
        countParams.push(endDate);
      }
      
      const [countResult] = await db.execute(countQuery, countParams);
      const total = countResult[0].total;
      
      res.json({
        data: sales,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching uplift sales:', error);
      res.status(500).json({ message: 'Failed to fetch uplift sales', error: error.message });
    }
  },

  // Get uplift sale by ID
  getUpliftSaleById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          us.*,
          c.name as clientName,
          u.name as userName,
          u.email as userEmail
        FROM UpliftSale us
        LEFT JOIN Clients c ON us.clientId = c.id
        LEFT JOIN SalesRep u ON us.userId = u.id
        WHERE us.id = ?
      `;
      
      const [sales] = await db.execute(query, [id]);
      
      if (sales.length === 0) {
        return res.status(404).json({ message: 'Uplift sale not found' });
      }
      
      const sale = sales[0];
      
      // Fetch UpliftSaleItems for this sale
      const itemsQuery = `
        SELECT 
          usi.*,
          p.product_name as productName,
          p.description as productDescription
        FROM UpliftSaleItem usi
        LEFT JOIN products p ON usi.productId = p.id
        WHERE usi.upliftSaleId = ?
      `;
      const [items] = await db.execute(itemsQuery, [id]);
      sale.items = items;
      
      res.json(sale);
    } catch (error) {
      console.error('Error fetching uplift sale:', error);
      res.status(500).json({ message: 'Failed to fetch uplift sale', error: error.message });
    }
  },

  // Create new uplift sale
  createUpliftSale: async (req, res) => {
    try {
      const { clientId, userId, status = 'pending', totalAmount } = req.body;
      
      // Validate required fields
      if (!clientId || !userId || totalAmount === undefined) {
        return res.status(400).json({ message: 'clientId, userId, and totalAmount are required' });
      }
      
      // Validate totalAmount is positive
      if (totalAmount < 0) {
        return res.status(400).json({ message: 'totalAmount must be positive' });
      }
      
      // Check if client exists
      const [clients] = await db.execute('SELECT id FROM Clients WHERE id = ?', [clientId]);
      if (clients.length === 0) {
        return res.status(400).json({ message: 'Client not found' });
      }
      
      // Check if user exists
      const [users] = await db.execute('SELECT id FROM SalesRep WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }
      
      const query = `
        INSERT INTO UpliftSale (clientId, userId, status, totalAmount)
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [clientId, userId, status, totalAmount]);
      
      // Fetch the created sale
      const [newSale] = await db.execute('SELECT * FROM UpliftSale WHERE id = ?', [result.insertId]);
      
      res.status(201).json(newSale[0]);
    } catch (error) {
      console.error('Error creating uplift sale:', error);
      res.status(500).json({ message: 'Failed to create uplift sale', error: error.message });
    }
  },

  // Update uplift sale
  updateUpliftSale: async (req, res) => {
    try {
      const { id } = req.params;
      const { clientId, userId, status, totalAmount } = req.body;
      
      // Check if sale exists
      const [existingSales] = await db.execute('SELECT * FROM UpliftSale WHERE id = ?', [id]);
      if (existingSales.length === 0) {
        return res.status(404).json({ message: 'Uplift sale not found' });
      }
      
      // Build update query dynamically
      let updateFields = [];
      let params = [];
      
      if (clientId !== undefined) {
        // Check if client exists
        const [clients] = await db.execute('SELECT id FROM Clients WHERE id = ?', [clientId]);
        if (clients.length === 0) {
          return res.status(400).json({ message: 'Client not found' });
        }
        updateFields.push('clientId = ?');
        params.push(clientId);
      }
      
      if (userId !== undefined) {
        // Check if user exists
        const [users] = await db.execute('SELECT id FROM SalesRep WHERE id = ?', [userId]);
        if (users.length === 0) {
          return res.status(400).json({ message: 'User not found' });
        }
        updateFields.push('userId = ?');
        params.push(userId);
      }
      
      if (status !== undefined) {
        updateFields.push('status = ?');
        params.push(status);
      }
      
      if (totalAmount !== undefined) {
        if (totalAmount < 0) {
          return res.status(400).json({ message: 'totalAmount must be positive' });
        }
        updateFields.push('totalAmount = ?');
        params.push(totalAmount);
      }
      
      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      updateFields.push('updatedAt = CURRENT_TIMESTAMP(3)');
      params.push(id);
      
      const query = `UPDATE UpliftSale SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await db.execute(query, params);
      
      // Fetch the updated sale
      const [updatedSale] = await db.execute('SELECT * FROM UpliftSale WHERE id = ?', [id]);
      
      res.json(updatedSale[0]);
    } catch (error) {
      console.error('Error updating uplift sale:', error);
      res.status(500).json({ message: 'Failed to update uplift sale', error: error.message });
    }
  },

  // Update status only
  updateUpliftSaleStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      // Check if sale exists
      const [existingSales] = await db.execute('SELECT * FROM UpliftSale WHERE id = ?', [id]);
      if (existingSales.length === 0) {
        return res.status(404).json({ message: 'Uplift sale not found' });
      }
      
      const query = 'UPDATE UpliftSale SET status = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?';
      
      await db.execute(query, [status, id]);
      
      // Fetch the updated sale
      const [updatedSale] = await db.execute('SELECT * FROM UpliftSale WHERE id = ?', [id]);
      
      res.json(updatedSale[0]);
    } catch (error) {
      console.error('Error updating uplift sale status:', error);
      res.status(500).json({ message: 'Failed to update uplift sale status', error: error.message });
    }
  },

  // Delete uplift sale
  deleteUpliftSale: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if sale exists
      const [existingSales] = await db.execute('SELECT * FROM UpliftSale WHERE id = ?', [id]);
      if (existingSales.length === 0) {
        return res.status(404).json({ message: 'Uplift sale not found' });
      }
      
      await db.execute('DELETE FROM UpliftSale WHERE id = ?', [id]);
      
      res.json({ success: true, message: 'Uplift sale deleted successfully' });
    } catch (error) {
      console.error('Error deleting uplift sale:', error);
      res.status(500).json({ message: 'Failed to delete uplift sale', error: error.message });
    }
  },

  // Get uplift sales statistics
  getUpliftSalesStats: async (req, res) => {
    try {
      const { startDate, endDate, clientId, userId } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (startDate) {
        whereClause += ' AND DATE(createdAt) >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        whereClause += ' AND DATE(createdAt) <= ?';
        params.push(endDate);
      }
      
      if (clientId) {
        whereClause += ' AND clientId = ?';
        params.push(clientId);
      }
      
      if (userId) {
        whereClause += ' AND userId = ?';
        params.push(userId);
      }
      
      const query = `
        SELECT 
          COUNT(*) as totalSales,
          SUM(totalAmount) as totalAmount,
          AVG(totalAmount) as averageAmount,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingCount,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCount,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledCount
        FROM UpliftSale
        ${whereClause}
      `;
      
      const [stats] = await db.execute(query, params);
      
      const result = {
        totalSales: parseInt(stats[0].totalSales) || 0,
        totalAmount: parseFloat(stats[0].totalAmount) || 0,
        averageAmount: parseFloat(stats[0].averageAmount) || 0,
        pendingCount: parseInt(stats[0].pendingCount) || 0,
        completedCount: parseInt(stats[0].completedCount) || 0,
        cancelledCount: parseInt(stats[0].cancelledCount) || 0
      };
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching uplift sales stats:', error);
      res.status(500).json({ message: 'Failed to fetch uplift sales statistics', error: error.message });
    }
  }
};

module.exports = upliftSalesController;
