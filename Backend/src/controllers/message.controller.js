import cloudinary from "../lib/cloudinary.lib.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket.js";
import fs from "fs/promises";

const getUsersForSidebar = async (req, res) => {
  const userId = req.user._id;
  try {
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );

    // Aggregate unread counts in one query instead of per-user lookups.
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          seen: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unSeenMessages = unreadCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res
      .status(200)
      .json({ success: true, users: filteredUsers, unSeenMessages });
  } catch (error) {
    console.log(error.message);
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
    // Always return chat history in ascending time order.
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });
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
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markMessageAsSeen = async (req, res) => {
  const { id } = req.params;
  try {
    const existingMessage = await Message.findById(id);
    if (!existingMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Only the receiver is allowed to mark this message as seen.
    if (String(existingMessage.receiverId) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Not allowed to update this message" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(id, { seen: true }, { new: true });

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
    console.log(error.message);
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
  // Track temp file path so cleanup can run in finally.
  const tempFilePath = req.file?.path;
  try {
    const trimmedText = typeof text === "string" ? text.trim() : "";
    let imageUrl = "";

    if (tempFilePath) {
      // Upload local temp image to Cloudinary first.
      const uploadResult = await cloudinary.uploader.upload(tempFilePath);
      imageUrl = uploadResult.secure_url;
    }

    // Prevent empty messages (no text and no image).
    if (!trimmedText && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Message text or image is required",
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: trimmedText,
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
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (tempFilePath) {
      // Delete temp upload whether request succeeds or fails.
      await fs.unlink(tempFilePath).catch(() => null);
    }
  }
};

const editMessage = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  try {
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only the sender can edit their own message.
    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not allowed to edit this message" });
    }

    const trimmedText = typeof text === "string" ? text.trim() : "";
    if (!trimmedText) {
      return res.status(400).json({ success: false, message: "Message text cannot be empty" });
    }

    message.text = trimmedText;
    message.isEdited = true;
    await message.save();

    // Notify receiver in real-time about the edit.
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", {
        _id: message._id,
        text: message.text,
        isEdited: true,
      });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only the sender can delete their own message.
    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not allowed to delete this message" });
    }

    // Already deleted — idempotent.
    if (message.isDeleted) {
      return res.status(200).json({ success: true, message });
    }

    // Remove image from Cloudinary before clearing the URL.
    if (message.image) {
      try {
        const urlParts = message.image.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.warn("Failed to delete image from Cloudinary:", cloudinaryError.message);
      }
    }

    // Soft-delete: keep the record but wipe content.
    message.isDeleted = true;
    message.text = "";
    message.image = "";
    message.isEdited = false;
    await message.save();

    // Notify receiver so they can render the "deleted" placeholder.
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { _id: message._id });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getUsersForSidebar, getMessages, markMessageAsSeen, sendMessage, editMessage, deleteMessage };
