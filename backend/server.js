import express from "express";
import dotenv from "dotenv";
import authenticateToken from "./src/middlewares/authMiddleware.js";
import connectDB from "./src/connection/mongoConnection.js";
import authRoutes from "./src/routes/authRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/customers", authenticateToken, customerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
