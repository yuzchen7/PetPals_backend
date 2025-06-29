import express from 'express';
import getPetsHealth from '../controllers/petHealthController';
import { verifyToken } from '../middleware/authMiddleware';
const router = express.Router();

router.get(
    '/', 
    verifyToken,
    getPetsHealth.getPetAllHealth
);

router.get(
    '/pet/:id', 
    verifyToken,
    getPetsHealth.getPetHealth
);

router.post(
    '/create/:id', 
    verifyToken,
    getPetsHealth.createPetHealth
);

router.put(
    '/update/:id', 
    verifyToken,
    getPetsHealth.updatePetHealth
);

router.delete(
    '/delete/:id', 
    verifyToken,
    getPetsHealth.deletePetHealth
);

export default router;