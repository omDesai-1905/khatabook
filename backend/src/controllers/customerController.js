const Customer = require("../model/Customer.model");
const Transaction = require("../model/Transaction.model");

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user.userId });

    const customersWithBalance = await Promise.all(
      customers.map(async (customer) => {
        const transactions = await Transaction.find({
          customerId: customer._id,
        });

        let balance = 0;
        transactions.forEach((transaction) => {
          if (transaction.type === "credit") {
            balance += transaction.amount;
          } else {
            balance -= transaction.amount;
          }
        });

        return {
          ...customer.toObject(),
          balance,
        };
      })
    );

    res.json(customersWithBalance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const customer = new Customer({
      name,
      phone,
      userId: req.user.userId,
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCustomerTransactions = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const transactions = await Transaction.find({ customerId: id }).sort({
      createdAt: -1,
    });

    res.json({ customer, transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, date } = req.body;

    // if (!type || !amount || !description) {
    if (!type || !amount) {
      return res.status(400).json({ message: "Type, amount are required" });
    }

    if (type !== "debit" && type !== "credit") {
      return res
        .status(400)
        .json({ message: "Type must be either debit or credit" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const transaction = new Transaction({
      customerId: id,
      userId: req.user.userId,
      type,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(), // Use provided date or current date
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name, phone },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    // Optionally delete all transactions for this customer
    await Transaction.deleteMany({ customerId: id });
    res.json({ message: "Customer and related transactions deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id, transactionId } = req.params;
    const { type, amount, description, date } = req.body;
    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const updateData = { type, amount, description };
    if (date) {
      updateData.date = new Date(date);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, customerId: id, userId: req.user.userId },
      updateData,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id, transactionId } = req.params;
    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: id,
      userId: req.user.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      customerId: id,
      userId: req.user.userId,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
