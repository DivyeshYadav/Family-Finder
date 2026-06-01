const compareFaces = async (image1Base64, image2Base64) => {
  try {
    if (image1Base64 && image2Base64) {
      return Math.random() > 0.6;
    }
    return false;
  } catch (error) {
    console.log('Face comparison error:', error);
    return false;
  }
};

module.exports = { compareFaces };
