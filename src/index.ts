import { config } from 'dotenv';
import { Request, Response } from 'express';
import express from 'express';
const app = express();
const PORT = 3000;
import petsRoutes from './routes/petsRoutes';
import usersRoutes from './routes/usersRoutes';

config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from PetPals backend!');
});
app.use('/api/pets', petsRoutes);
app.use('/api/user', usersRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});