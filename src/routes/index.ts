import express from 'express';
const router = express.Router();
import petsController from './petsRoutes';
import usersController from './usersRoutes';

router.use('/pets', petsController);
router.use('/user', usersController)

export default router;