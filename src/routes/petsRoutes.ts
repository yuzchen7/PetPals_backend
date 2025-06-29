import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/authMiddleware';
import petsController from '../controllers/petsController';

router.get('/', petsController.getAllPets);
router.post(
    '/create', 
    verifyToken,
    petsController.createPet
);
router.put('/update', petsController.updatePet);
router.delete('/delete', petsController.deletePet);
router.get('/details/:id', petsController.getPetDetails);

export default router;