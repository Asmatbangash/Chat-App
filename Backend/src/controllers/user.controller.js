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

    // Normalize email for consistent unique matching.
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "user already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      FullName,
      email: normalizedEmail,
      password: hashPassword,
      bio,
    });

    // Remove password before sending user object to client.
    const token = generateToken(newUser._id);
    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      userData,
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
    // Normalize email so login matches signup normalization.
    const normalizedEmail = email.toLowerCase().trim();
    const userData = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    // Return early for unknown account to avoid null password compare.
    if (!userData) {
      return res
        .status(401)
        .json({ success: false, message: "invalid credentials!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    // Return immediately on invalid password to avoid duplicate responses.
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "invalid credentials!" });
    }
    const token = generateToken(userData._id);
    // Remove password before returning the authenticated user.
    const safeUser = userData.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      userData: safeUser,
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
    user: req.user,
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
        message: "profile update successfully!",
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
