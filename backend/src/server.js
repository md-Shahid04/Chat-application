import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Infrastructure configurations import
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { initChatSocket } from "./sockets/chatSocket.js";

// Load system environment definitions before initializing other files
dotenv.config();

// Establish persistent database transaction links
connectDB();

const app = express();
const server = http.createServer(app);

// Configure strict Cross-Origin Resource Sharing rules
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Request parser middleware layers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resolve directory roots securely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FIX: Go up one level using '..' to create/access the 'uploads' directory at backend/uploads
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(
    "[System Initialization] Uploads media directory mounted cleanly at root.",
  );
}

// Map accessible local directories static assets pipe
app.use("/uploads", express.static(uploadDir));

// Route bindings map orchestration pipeline
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Global Error Catchment Middleware boundary fallback
app.use((err, req, res, next) => {
  console.error(`[Global App Error Structure Intercept]: ${err.stack}`);
  res.status(500).json({
    message:
      "An unexpected application state exception occurred within the host engine process context.",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Configure full WebSocket operational suite layer
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
  },
});

initChatSocket(io);

// Spin up runtime execution pipeline listeners
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `[Core System Operational Node active] Engine tracking processes safely on network port: ${PORT}`,
  );
});
