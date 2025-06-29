import express from 'express';
import eventsController from '../controllers/eventsController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', verifyToken, eventsController.getAllReminders);
router.post('/pet/:petId', verifyToken, eventsController.addReminders);
router.get('/:eventId', verifyToken, eventsController.getReminderDetail);
router.get('/pet/:petId', verifyToken, eventsController.getRemindersByPet);
router.delete('/:eventId', verifyToken, eventsController.deleteReminders);
router.put('/:eventId', verifyToken, eventsController.updateReminders);

export default router;