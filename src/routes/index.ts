import express from 'express';
const router = express.Router();
import petsController from './petsRoutes';
import usersController from './usersRoutes';
import eventsController from './eventsRoutes';

router.use('/pets', petsController);
router.use('/user', usersController)
router.use('/reminders', eventsController)


export default router;