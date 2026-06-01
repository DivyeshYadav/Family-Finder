const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/create-or-update', auth, async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, profilePicture, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        profile: {
          firstName,
          lastName,
          dateOfBirth,
          profilePicture,
          bio,
          created: true
        }
      },
      { new: true }
    );
    res.json({ message: 'Profile saved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/get/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('profile familyMembers');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
