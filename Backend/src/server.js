import express from "express";
import "dotenv/config";
import cors from "cors";

import dbConnectioin from "./db/db.connection.js";
import messageRouter from "./routes/message.routes.js";
import userRouter from "./routes/user.routes.js";
import { app, server } from "./socket.js";

const port = process.env.PORT || 4000;

await dbConnectioin();

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length === 1 && allowedOrigins[0] === "*"
      ? "*"
      : allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World from Node.js backend!");
});

// REST APIs stay unchanged.
app.use("/api/v1/user", userRouter);
app.use("/api/v1/messages", messageRouter);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
