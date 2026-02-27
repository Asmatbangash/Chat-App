import express from 'express';
import dbConnectioin from './db/db.connection.js';
import dotenv from 'dotenv'
import cors from 'cors'
import messageRouter from './routes/message.routes.js';
import userRouter from './routes/user.routes.js';

const app = express();
const port = 4000;

dotenv.config()

await dbConnectioin()

// middlewares
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World from Node.js backend!');
});

// routes 
app.use("/api/v1/user", userRouter)
app.use("/api/v1/messages", messageRouter)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
