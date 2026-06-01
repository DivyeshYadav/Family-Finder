const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const matchingService = require('../services/matchingService');

const router = express.Router();

router.get('/get', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('notifications');
    res.json(user.notifications || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/mark-read/:notificationId', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          'notifications.$[elem].read': true
        }
      },
      {
        arrayFilters: [{ 'elem._id': req.params.notificationId }],
        new: true
      }
    );
    res.json({ message: 'Notification marked as read', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/check-matches', auth, async (req, res) => {
  try {
    await matchingService.checkForMatches(req.user.userId);
    res.json({ message: 'Matching check completed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
