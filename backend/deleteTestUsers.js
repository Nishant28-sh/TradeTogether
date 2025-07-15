require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skill-exchange';

async function deleteUsers() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const result = await User.deleteMany({
      email: { $in: ["sarah@example.com", "mike@example.com", "emma@example.com"] }
    });
    console.log('Deleted users:', result.deletedCount);
    process.exit(0);
  } catch (err) {
    console.error('Error deleting users:', err);
    process.exit(1);
  }
}

deleteUsers(); 