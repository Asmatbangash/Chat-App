import express from 'express'
import protectRoute from '../middleware/auth.middleware.js'
import { upload } from '../middleware/multer.middleware.js'
import { 
  getMessages, 
  getUsersForSidebar, 
  markMessageAsSeen, 
  sendMessage,
  editMessage,
  deleteMessage,
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

// Edit a message (sender only)
messageRouter.put("/edit/:id", protectRoute, editMessage)

// Delete a message (sender only)
messageRouter.delete("/delete/:id", protectRoute, deleteMessage)

export default messageRouter
