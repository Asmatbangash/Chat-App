import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

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

export { getUsersForSidebar, getMessages };
