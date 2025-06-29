import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/authMiddleware';
import petsController from '../controllers/petsController';

router.get(
    '/', 
    verifyToken,
    petsController.getAllPets
);

router.post(
    '/create', 
    verifyToken,
    petsController.createPet
);
router.put('/update', petsController.updatePet);

router.delete(
    '/delete/:id', 
    verifyToken,
    petsController.deletePet
);

router.get(
    '/details/:id',
    verifyToken,
    petsController.getPetDetails
);

export default router;