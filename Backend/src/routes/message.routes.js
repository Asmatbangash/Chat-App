import express from 'express'
import protectRoute from '../middleware/auth.middleware.js'
import { upload } from '../middleware/multer.middleware.js'
import { 
  getMessages, 
  getUsersForSidebar, 
  markMessageAsSeen, 
  sendMessage 
} from '../controllers/message.controller.js'

const messageRouter = express.Router()

// Get users
messageRouter.get("/users", protectRoute, getUsersForSidebar)

// Get messages
messageRouter.get("/:id", protectRoute, getMessages)

// Mark as seen
messageRouter.patch("/mark/:id", protectRoute, markMessageAsSeen)

// Send message with image upload
messageRouter.post(
  "/send-message/:receiverId",
  protectRoute,
  upload.single("image"),
  sendMessage
)

export default messageRouter
