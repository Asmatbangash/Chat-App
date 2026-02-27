import cloudinary from "../lib/cloudinary.lib.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
// import fs from "fs";

const getUsersForSidebar = async (req, res) => {
  const userId = req.user._id;
  try {
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );
    const unSeenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messsages = await Message.find({
        senderId: user._id,
        recievedId: userId,
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
        { senderId: myId, recievedId: selectedUserId },
        { senderId: selectedUserId, recievedId: myId },
      ],
    });
    await Message.updateMany({ senderId: selectedUserId, recievedId: myId });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.log(error.messsage);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markMessageAsSeen = async(req, res) =>{
  const {id} = req.params
  try {
     await Message.findByIdAndUpdate(id, {seen: true}, {new: true})
    res.status(200).json({success: true})
  } catch (error) {
    console.log(error.messsage);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.params;
  const { text } = req.body;
  try {
    let imageUrl = "";

    if (req.file?.path) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path);
      imageUrl = uploadResult.secure_url;
      console.log(imageUrl)
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
