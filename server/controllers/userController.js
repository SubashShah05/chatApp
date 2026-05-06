// controllers/userController.js
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Signup
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName: fullName,
      email,
      password: hashedPassword,
      bio
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        bio: newUser.bio,
        profilePic: newUser.profilePic
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = generateToken(userData._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: userData._id,
        fullName: userData.fullName,
        email: userData.email,
        bio: userData.bio,
        profilePic: userData.profilePic
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check auth
// export const checkAuth = (req, res) => {
//   res.json({
//     success: true,
//     user: {
//       _id: req.user._id,
//       fullName: req.user.fullName,
//       email: req.user.email,
//       bio: req.user.bio,
//       profilePic: req.user.profilePic
//     }
//   });
// };


// Check auth
export const checkAuth = (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        bio: req.user.bio,
        profilePic: req.user.profilePic
      }
    });
  } catch (error) {
    console.error("CHECK AUTH ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check auth"
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {

    const { profilePic, fullName, bio } = req.body;
    const userId = req.user._id;

    let updateData = { fullName, bio };

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = upload.secure_url;
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated",
      user: updateUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};







