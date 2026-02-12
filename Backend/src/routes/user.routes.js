import express from 'express'
import { login, SignUp } from '../controllers/user.controller.js'

const router = express.Router()

router.post("/signUp", SignUp)
router.post("/login", login)


export default router