import { Router } from "express";
import { FirebaseAuthController } from "../controllers/Auth.controller"; // (Option 1)
import { adminOnly } from "../middlewares/admin.middleware";
const router = Router();

const controller = new FirebaseAuthController();




router.post("/verify", (req, res) => controller.verifyFirebaseTokenAndSync(req, res));

router.post("/syncall",  (req, res) => controller.syncAllFirebaseUsers(req, res));

router.post("/generatetoken", (req, res) => controller.generateJwtForUser(req, res));



export default router;