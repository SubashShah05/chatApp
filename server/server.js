// // server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import http from "http";
// import { Server } from "socket.io";
// import { initSocket } from "./socket/socket.js";

// import { connectDB } from "./lib/db.js";
// import userRouter from "./routes/userRoutes.js";
// import messageRouter from "./routes/messageRoute.js"; // Make sure filename matches

// dotenv.config();

// const app = express();
// const server = http.createServer(app);

// // Initialize socket.io server
// export const io = new Server(server, {
//   cors: { origin: "*" }
// });

// //store online Users
// export const userSocketMap = {};

// //socket.io connection handler
// io.on("connection", (socket) => {

//   const userId = socket.handshake.query.userId;
//   console.log("User connected with ID:", userId);

//   if (userId) userSocketMap[userId] = socket.id;

//   //Emit online users to all connected clients
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {

//     console.log("User disconnected with ID:", userId);

//     delete userSocketMap[userId];

//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   });

// });

// // Middlewares
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(cors());

// // Test route
// app.use("/api/status", (req, res) => res.send("Server is running..."));

// // Routes
// app.use("/api/auth", userRouter);
// app.use("/api/messages", messageRouter);

// // Start server
// const startServer = async () => {
//   try {

//     await connectDB();

//     const PORT = process.env.PORT || 5001;

//     server.listen(PORT, () => {
//       console.log("Server running on http://localhost:" + PORT);
//     });

//   } catch (error) {
//     console.log("Server start failed:", error);
//   }
// };

// startServer();





// server.js
// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { initSocket, userSocketMap, userStatusMap, getIO } from "./socket/socket.js";

import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoute.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = initSocket(server);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Test route
app.use("/api/status", (req, res) => res.send("Server is running..."));

// Routes
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5001;

    server.listen(PORT, () => {
      console.log("Server running on http://localhost:" + PORT);
    });

  } catch (error) {
    console.log("Server start failed:", error);
  }
};

startServer();

// Export for other files
export { userSocketMap, userStatusMap, getIO };