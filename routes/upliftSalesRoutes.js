const express = require('express');
const router = express.Router();
const upliftSalesController = require('../controllers/upliftSalesController');

// Get all uplift sales with optional filters
router.get('/', upliftSalesController.getAllUpliftSales);

// Get uplift sales statistics
router.get('/stats', upliftSalesController.getUpliftSalesStats);

// Get uplift sale by ID
router.get('/:id', upliftSalesController.getUpliftSaleById);

// Create new uplift sale
router.post('/', upliftSalesController.createUpliftSale);

// Update uplift sale
router.put('/:id', upliftSalesController.updateUpliftSale);

// Update uplift sale status only
router.patch('/:id/status', upliftSalesController.updateUpliftSaleStatus);

// Delete uplift sale
router.delete('/:id', upliftSalesController.deleteUpliftSale);

module.exports = router;
