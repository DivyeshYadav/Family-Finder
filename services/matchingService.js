const User = require('../models/User');
const faceRecognitionService = require('./faceRecognitionService');

const extractNames = (familyMembers) => {
  return familyMembers.map(member => member.name.toLowerCase().trim());
};

const countMatches = (names1, names2) => {
  const matches = names1.filter(name => names2.includes(name));
  return matches.length;
};

const checkForMatches = async (userId) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser.profile.created || !currentUser.familyMembers.length) {
      return;
    }
    const currentUserNames = extractNames(currentUser.familyMembers);
    const allUsers = await User.find({ _id: { $ne: userId }, 'profile.created': true });
    for (let otherUser of allUsers) {
      if (!otherUser.familyMembers.length) continue;
      const otherUserNames = extractNames(otherUser.familyMembers);
      const matchCount = countMatches(currentUserNames, otherUserNames);
      if (matchCount >= 3) {
        let faceMatch = false;
        if (currentUser.profile.profilePicture && otherUser.profile.profilePicture) {
          faceMatch = await faceRecognitionService.compareFaces(
            currentUser.profile.profilePicture,
            otherUser.profile.profilePicture
          );
        }
        const existingNotification = currentUser.notifications.find(
          notif => notif.userId.toString() === otherUser._id.toString()
        );
        if (!existingNotification) {
          await User.findByIdAndUpdate(
            userId,
            {
              $push: {
                notifications: {
                  userId: otherUser._id,
                  userName: `${otherUser.profile.firstName} ${otherUser.profile.lastName}`,
                  userProfilePicture: otherUser.profile.profilePicture,
                  matchedMembers: currentUserNames.filter(name => otherUserNames.includes(name)),
                  faceMatch,
                  read: false
                }
              }
            }
          );
          await User.findByIdAndUpdate(
            otherUser._id,
            {
              $push: {
                notifications: {
                  userId: currentUser._id,
                  userName: `${currentUser.profile.firstName} ${currentUser.profile.lastName}`,
                  userProfilePicture: currentUser.profile.profilePicture,
                  matchedMembers: otherUserNames.filter(name => currentUserNames.includes(name)),
                  faceMatch,
                  read: false
                }
              }
            }
          );
        }
      }
    }
  } catch (error) {
    console.log('Error in matching service:', error);
  }
};

module.exports = { checkForMatches };
