import express from 'express';
const router = express.Router();
import petsController from './petsRoutes';
import usersController from './usersRoutes';
import healthController from './petsHealthRoutes';
import eventsController from './eventsRoutes';

router.use('/pets', petsController);
router.use('/user', usersController);
router.use('/health', healthController);
router.use('/reminders', eventsController)

export default router;