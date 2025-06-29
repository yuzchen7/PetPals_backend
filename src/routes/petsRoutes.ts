import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/authMiddleware';
import petsController from '../controllers/petsController';
import petActivitesController from '../controllers/petActivitesController';

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

router.put(
    '/update/:id', 
    verifyToken,
    petsController.updatePet
);

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

router.get(
    '/activities',
    verifyToken,
    petActivitesController.getAllActivities
);

router.get(
    '/:petId/activities/',
    verifyToken,
    petActivitesController.getActivitiesByPet
)

router.post(
    '/:petId/activities',
    verifyToken,
    petActivitesController.addPetActivity
)

router.put(
    '/activities/:activityId',
    verifyToken,
    petActivitesController.updatePetActivity
)

router.delete(
    '/activities/:activityId',
    verifyToken,
    petActivitesController.deletePetActivity
)

router.get(
    '/:petId/activities/count',
    verifyToken,
    petActivitesController.getActivityCountByPet
)

export default router;