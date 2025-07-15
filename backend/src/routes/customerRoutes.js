const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/", authenticateToken, customerController.getAllCustomers);
router.post("/", authenticateToken, customerController.createCustomer);
router.get("/:id/transactions", authenticateToken, customerController.getCustomerTransactions);
router.post("/:id/transactions", authenticateToken, customerController.addTransaction);
router.put("/:id", authenticateToken, customerController.updateCustomer);
router.delete("/:id", authenticateToken, customerController.deleteCustomer);
router.put("/:id/transactions/:transactionId", authenticateToken, customerController.updateTransaction);
router.delete("/:id/transactions/:transactionId", authenticateToken, customerController.deleteTransaction);

module.exports = router;
