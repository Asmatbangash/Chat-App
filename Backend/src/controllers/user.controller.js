import cloudinary from "../lib/cloudinary.lib.js";
import { generateToken } from "../lib/utills.lib.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

const SignUp = async (req, res) => {
  const { FullName, email, password, bio } = req.body;
  try {
    if (!FullName || !email || !password || !bio) {
      return res
        .status(400)
        .json({ success: false, message: "missing details" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "user already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      FullName,
      email,
      password: hashPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      userData: newUser,
      token,
      message: "user created successfully!",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "missing details" });
    }
    const userData = await User.findOne({ email });

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      res.status(404).json({ success: false, message: "invalid credintail!" });
    }
    const token = generateToken(userData._id);

    res.status(200).json({
      success: true,
      userData,
      token,
      message: "user login successfully!",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const checkAuth = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};

const updateUserProfile = async (req, res) => {
  const { profilePic, FullName, bio } = req.body;
  try {
    const userId = req.user._id;
    let updateUser;
    if (!profilePic) {
      updateUser = await User.findByIdAndUpdate(
        userId,
        { FullName, bio },
        { new: true },
      );
    } else {
      const uploadProfilePic = await cloudinary.uploader.upload(profilePic);
      updateUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadProfilePic.secure_url, FullName, bio },
        { new: true },
      );
    }

    res
      .status(200)
      .json({
        success: true,
        user: updateUser,
        messsage: "profile update successfully!",
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { SignUp, login, checkAuth, updateUserProfile };
