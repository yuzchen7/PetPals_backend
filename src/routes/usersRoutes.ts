import express from 'express';
const router = express.Router();
import usersController from "../controllers/usersController";

router.post('/signup', usersController.signup)
router.post('/login', usersController.login)
router.put('/refreshAccessToken', usersController.refreshAccessToken)

export default router;