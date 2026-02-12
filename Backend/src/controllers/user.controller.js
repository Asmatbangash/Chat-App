import { generateToken } from "../lib/utills.lib.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

const SignUp = async (req, res) => {
  const { FullName, email, password, bio } = req.body;
  try {
    if (!FullName || !email || !password || !bio) {
      return res.json({ success: false, message: "missing details" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "user already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      FullName,
      email,
      password:hashPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.json({
      success: true,
      userData: newUser,
      token,
      message: "user created successfully!",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.json({ success: false, message: "missing details" });
    }
    const userData = await User.findOne({ email });

    const isPasswordCorrect = bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      res.json({ success: false, message: "invalid credintail!" });
    }
    const token = generateToken(userData._id);

    res.json({
      success: true,
      userData,
      token,
      message: "user login successfully!",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { SignUp, login };
