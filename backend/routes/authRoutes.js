
import express from "express";
import { signup, login, me, updateMe, syncXP, syncCertification, getProgress, logout } from "../controller/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, me);
router.put("/me", auth, updateMe);
router.post("/logout", auth, logout);
router.get("/progress", auth, getProgress);
router.post("/xp", auth, syncXP);
router.post("/certification", auth, syncCertification);

export default router;
