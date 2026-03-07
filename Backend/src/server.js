import express from "express";
import "dotenv/config";
import cors from "cors";

import dbConnectioin from "./db/db.connection.js";
import messageRouter from "./routes/message.routes.js";
import userRouter from "./routes/user.routes.js";
import { app, server } from "./socket.js";

const port = process.env.PORT || 4000;

// Stop startup if DB is unavailable; API should not run in degraded mode.
try {
  await dbConnectioin();
} catch (error) {
  console.error("Failed to connect database:", error.message);
  process.exit(1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowWildcardOrigin = allowedOrigins.length === 1 && allowedOrigins[0] === "*";

app.use(
  cors({
    // `credentials` cannot be true when origin is wildcard.
    origin: allowWildcardOrigin ? "*" : allowedOrigins,
    credentials: !allowWildcardOrigin,
  }),
);

// Increase payload limits for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get("/", (req, res) => {
  res.send("Hello World from Node.js backend!");
});

// REST APIs stay unchanged.
app.use("/api/v1/user", userRouter);
app.use("/api/v1/messages", messageRouter);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
