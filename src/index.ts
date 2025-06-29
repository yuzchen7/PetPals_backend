import { config } from 'dotenv';
import { Request, Response } from 'express';
import router from './routes';
import express from 'express';
const app = express();
const PORT = 3000;
var cookieParser = require('cookie-parser');

config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from PetPals backend!');
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});