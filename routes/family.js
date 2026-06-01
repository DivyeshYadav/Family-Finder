const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/add-member', auth, async (req, res) => {
  try {
    const { name, relation, dateOfBirth } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $push: {
          familyMembers: { name, relation, dateOfBirth }
        }
      },
      { new: true }
    );
    res.json({ message: 'Family member added', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/edit-member/:memberId', auth, async (req, res) => {
  try {
    const { name, relation, dateOfBirth } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          'familyMembers.$[elem]': { name, relation, dateOfBirth }
        }
      },
      {
        arrayFilters: [{ 'elem._id': req.params.memberId }],
        new: true
      }
    );
    res.json({ message: 'Family member updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/delete-member/:memberId', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $pull: {
          familyMembers: { _id: req.params.memberId }
        }
      },
      { new: true }
    );
    res.json({ message: 'Family member deleted', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/get-tree', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('familyMembers profile');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
