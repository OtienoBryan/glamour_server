const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Fetch all clients from the Clients table
router.get('/', clientController.getAllClients);
router.get('/types', clientController.getAllClientTypes);
router.get('/activity', clientController.getClientActivity);
router.get('/:id', clientController.getClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.get('/:id/history', clientController.getClientHistory);
router.get('/:id/payments', clientController.getClientPayments);
router.get('/:id/invoices', clientController.getClientInvoices);
router.get('/:id/stock', clientController.getClientStock);
router.get('/stock/all', clientController.getAllClientStock);
router.get('/stock/products', clientController.getProductsWithClientStock);
// Add other CRUD routes as needed

module.exports = router; 