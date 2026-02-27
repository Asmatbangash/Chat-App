import express from 'express'
import { checkAuth, login, SignUp, updateUserProfile } from '../controllers/user.controller.js'
import protectRoute from '../middleware/auth.middleware.js'

const userRouter = express.Router()

userRouter.post("/signUp", SignUp)
userRouter.post("/login", login)
userRouter.get("/checkAuth",protectRoute, checkAuth)
userRouter.patch("/update-profile", protectRoute, updateUserProfile)


export default userRouter