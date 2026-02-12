import express from 'express';
import dbConnectioin from './db/db.connection.js';
import dotenv from 'dotenv'

const app = express();
const port = 4000;

dotenv.config()

await dbConnectioin()

app.get('/', (req, res) => {
  res.send('Hello World from Node.js backend!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
