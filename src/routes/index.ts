import express from 'express';
const router = express.Router();
import petsController from './petsRoutes';
import usersController from './usersRoutes';
import healthController from './petsHealthRoutes';

router.use('/pets', petsController);
router.use('/user', usersController);
router.use('/health', healthController);

export default router;