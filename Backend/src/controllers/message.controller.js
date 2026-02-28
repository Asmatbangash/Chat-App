import cloudinary from "../lib/cloudinary.lib.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket.js";
// import fs from "fs";

const getUsersForSidebar = async (req, res) => {
  const userId = req.user._id;
  try {
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );
    // Build unread counters grouped by sender for sidebar badges.
    const unSeenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messsages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messsages.length > 0) {
        unSeenMessages[user._id] = messsages.length;
      }
    });
    await Promise.all(promises);
    res
      .status(200)
      .json({ success: true, users: filteredUsers, unSeenMessages });
  } catch (error) {
    console.log(error.messsage);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  const myId = req.user._id;
  const { id: selectedUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });
    // Find unseen messages from the selected user to the current user.
    const unseenMessages = await Message.find(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { _id: 1 },
    );

    if (unseenMessages.length > 0) {
      const unseenMessageIds = unseenMessages.map((message) => message._id);

      // Mark all newly opened messages as seen in one DB write.
      await Message.updateMany(
        { _id: { $in: unseenMessageIds } },
        { $set: { seen: true } },
      );

      // Notify sender that their outgoing messages are now seen.
      const senderSocketId = getReceiverSocketId(selectedUserId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", {
          messageIds: unseenMessageIds,
          seenBy: myId,
        });
      }
    }

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.log(error.messsage);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markMessageAsSeen = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { seen: true },
      { new: true },
    );

    if (updatedMessage) {
      // Send real-time read receipt for single-message seen updates.
      const senderSocketId = getReceiverSocketId(updatedMessage.senderId);

      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", {
          messageIds: [updatedMessage._id],
          seenBy: req.user._id,
        });
      }
    }

    res.status(200).json({ success: true, message: updatedMessage });
  } catch (error) {
    console.log(error.messsage);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.params;
  const { text } = req.body;
  try {
    let imageUrl = "";

    if (req.file?.path) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path);
      imageUrl = uploadResult.secure_url;
      console.log(imageUrl);
      // Remove temporary file after successful cloud upload.
      // fs.unlink(req.file.path, (unlinkError) => {
      //   if (unlinkError) {
      //     console.log(unlinkError.message);
      //   }
      // });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
      seen: false,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);

    // Emit message in real-time only if receiver is currently online.
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.log(error.messsage);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getUsersForSidebar, getMessages, markMessageAsSeen, sendMessage };
