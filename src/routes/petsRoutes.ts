import express from 'express';
const router = express.Router();
import petsController from '../controllers/petsController';

router.get('/', petsController.getAllPets);
router.post('/create', petsController.createPet);
router.put('/update', petsController.updatePet);
router.delete('/delete', petsController.deletePet);
router.get('/details/:id', petsController.getPetDetails);

export default router;