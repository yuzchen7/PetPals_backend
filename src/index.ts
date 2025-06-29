import { config } from 'dotenv';
import { Request, Response } from 'express';
import router from './routes';
import express from 'express';
const app = express();
const PORT = 3000;
var cookieParser = require('cookie-parser');
import eventsRoutes from './routes/eventsRoutes'

config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from PetPals backend!');
});

app.use('/api/pets', petsRoutes);
app.use('/api/user', usersRoutes)
app.use('/api/reminders', eventsRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});