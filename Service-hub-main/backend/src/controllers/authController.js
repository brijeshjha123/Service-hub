const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  console.log("DEBUG: Signup request received:", req.body);
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log(`DEBUG: Signup failed - User already exists: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: req.body.role || 'customer',
      serviceCategory: req.body.serviceCategory || undefined,
      phone: req.body.phone || '',
    });

    await user.save();

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("SIGNUP ERROR DETAILS:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`DEBUG: Login failed - User not found: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`DEBUG: Login failed - Password mismatch for: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log(`DEBUG: Login successful for ${email}. Role: ${user.role}`);
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { name, email, googleId } = req.body;

  // Validate that googleId is provided - it's required for unique identification
  if (!googleId) {
    console.error("DEBUG: Google login - missing googleId");
    return res.status(400).json({ message: 'Google ID is required for authentication' });
  }

  try {
    // PRIORITY 1: Find user by googleId (unique Firebase UID per Google account)
    let user = await User.findOne({ googleId });

    if (user) {
      console.log(`DEBUG: Google login - found user by googleId: ${user.email}`);
    } else {
      // PRIORITY 2: Check if user exists with this email (legacy or email/password signup)
      user = await User.findOne({ email });

      if (user) {
        // Link the googleId to existing account
        console.log(`DEBUG: Google login - linking googleId to existing email user: ${email}`);
        user.googleId = googleId;
        await user.save();
      } else {
        // PRIORITY 3: Create new user
        console.log(`DEBUG: Google login - creating new user: ${email} with googleId: ${googleId}`);
        const salt = await bcrypt.genSalt(10);
        const randomPassword = Math.random().toString(36).slice(-10) + Date.now();
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = new User({
          name: name || email.split('@')[0],
          email,
          googleId, // Store the unique Firebase UID
          password: hashedPassword,
          role: 'customer' // Always customer for Google signups
        });
        await user.save();
      }
    }

    // Generate JWT with the MongoDB user._id (unique per user in our system)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log(`DEBUG: Google login successful for ${email}. MongoDB ID: ${user._id}, GoogleId: ${googleId}`);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        googleId: user.googleId
      }
    });
  } catch (err) {
    console.error("GOOGLE LOGIN BACKEND ERROR:", err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
