import "dotenv/config";
import express from "express";
import mongoConnect from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const PORT = 3000;
const app = express();
mongoConnect();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

// Routes
app.use("/api/user", userRoutes);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => console.log("Server is running!"));
