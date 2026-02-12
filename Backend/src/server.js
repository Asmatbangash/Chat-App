import express from 'express';
import dbConnectioin from './db/db.connection.js';
import dotenv from 'dotenv'
import userRoute from './routes/user.routes.js'
import cors from 'cors'

const app = express();
const port = 4000;

dotenv.config()

await dbConnectioin()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World from Node.js backend!');
});

// routes 
app.use("/api/v1/user", userRoute)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
