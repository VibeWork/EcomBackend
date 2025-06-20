"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_controller_1 = require("../controllers/Auth.controller"); // (Option 1)
const router = (0, express_1.Router)();
const controller = new Auth_controller_1.FirebaseAuthController();
router.post("/verify", (req, res) => controller.verifyFirebaseTokenAndSync(req, res));
router.post("/syncall", (req, res) => controller.syncAllFirebaseUsers(req, res));
router.post("/generatetoken", (req, res) => controller.generateJwtForUser(req, res));
exports.default = router;
