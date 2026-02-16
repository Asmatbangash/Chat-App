import express from 'express'
import { checkAuth, login, SignUp, updateUserProfile } from '../controllers/user.controller.js'
import protectRoute from '../middleware/auth.middleware.js'

const router = express.Router()

router.post("/signUp", SignUp)
router.post("/login", login)
router.get("/checkAuth",protectRoute, checkAuth)
router.patch("/update-profile", protectRoute, updateUserProfile)


export default router