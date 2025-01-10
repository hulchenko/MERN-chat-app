import cors from "cors";
import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import mongoConnect from "./config/db.js";
import websocketConnect from "./config/websocket.js";
import { errorHandler } from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";

const PORT = 3000;
const app = express();
const server = createServer(app);

mongoConnect();
websocketConnect(server);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

// Routes
app.use("/api/user", userRoutes);

// Global error handler
app.use(errorHandler);

server.listen(PORT, () => console.log("Server is running...")); // listens to both HTTP and WS requests
