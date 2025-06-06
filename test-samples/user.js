// CommonJS module
const config = require('./config');

function generateUserId() {
  return Math.random().toString(36);
}

const getCurrentUser = () => {
  return { id: generateUserId(), name: 'Anonymous' };
};

module.exports = {
  generateUserId,
  getCurrentUser,
  createUser: (name) => ({ id: generateUserId(), name }),
  updateUserActivity: function(userId) {
    console.log(`Updated activity for ${userId}`);
  }
};
