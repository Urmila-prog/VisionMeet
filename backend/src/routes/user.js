import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    acceptfriendrequest,
    getmyfriends,
    getrecommendeduser,
    sendfriendrequest,
    getoutgoingfriendrequest,
    getincomingfriendrequest,
    getuserbyid
} from '../controllers/user.js';

const router = express.Router();

router.use(protectRoute)

// Specific routes first
router.get("/friends", getmyfriends);
router.get("/recommended", getrecommendeduser);
router.get('/friend-requests', getincomingfriendrequest);
router.get('/outgoing-friend-requests', getoutgoingfriendrequest);

// Parameterized routes last
router.get("/:id", getuserbyid);
router.post('/friend-request/:id', sendfriendrequest);
router.put('/friend-request/:id/accept', acceptfriendrequest);

export default router;