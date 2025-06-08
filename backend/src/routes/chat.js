import express from "express";
import { protectRoute } from '../middleware/auth.js'
import { getStreamToken, createStreamUser } from "../controllers/chat.js";

const router = express.Router();

router.get('/token', protectRoute, getStreamToken)
router.post('/user', protectRoute, createStreamUser)

export default router;