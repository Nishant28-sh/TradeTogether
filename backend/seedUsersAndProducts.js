require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Challenge = require('./models/Challenge');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skill-exchange';

const users = [
  {
    name: 'Rahul',
    email: 'rahul@gmail.com',
    password: '12345',
    skills: ['Woodworking'],
    location: 'Delhi',
    bio: 'Passionate creator sharing unique handmade treasures.',
    isArtisan: true,
    artisanLevel: 'Expert',
    yearsOfExperience: 5,
    specialties: ['Furniture', 'Carving'],
    profilePhoto: '/uploads/profilePhotos/rahul.jpg',
  },
  {
    name: 'Nishant Sharma',
    email: 'nishantsharma9034@gmail.com',
    password: 'nishant@1',
    isAdmin: true,
    role: 'admin',
    skills: ['Leadership', 'Community Management'],
    location: 'India',
    bio: 'Admin and community manager.',
    isArtisan: true,
    profilePhoto: '/uploads/profilePhotos/nishant.jpg',
  }
];

const products = [
  {
    title: 'Handmade Wooden Chair',
    description: 'A beautiful, sturdy chair made from reclaimed wood.',
    images: [],
    tags: ['wood', 'furniture'],
    value: 1500,
  },
  {
    title: 'Sunset Canvas Painting',
    description: 'A vibrant painting of a sunset over the mountains.',
    images: [],
    tags: ['art', 'painting'],
    value: 1200,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await User.deleteMany({});
    await Product.deleteMany({});
    // Hash passwords and insert users
    const userDocs = [];
    for (const user of users) {
      // Remove any existing user with the same email
      await User.deleteMany({ email: user.email });
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const userDoc = new User({ ...user, password: hashedPassword });
      await userDoc.save();
      userDocs.push(userDoc);
    }
    // Assign products to the first user
    const product1 = new Product({ ...products[0], owner: userDocs[0]._id });
    const product2 = new Product({ ...products[1], owner: userDocs[0]._id });
    await product1.save();
    await product2.save();

    // Create a challenge for the user
    const challenge = new Challenge({
      title: 'Handmade Art Challenge',
      description: 'Create and submit your best handmade art piece.',
      category: 'Monthly',
      theme: 'Creativity',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // starts tomorrow
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // ends in 15 days
      maxParticipants: 50,
      rules: ['Original work only', 'No plagiarism'],
      requirements: ['Submit at least one photo'],
      prizes: [{ rank: 1, description: 'Gold Badge', points: 100 }],
      tags: ['art', 'handmade', 'challenge'],
      difficulty: 'Beginner',
      createdBy: userDocs[0]._id,
      isActive: true
    });
    await challenge.save();
    console.log('Demo users, products, and challenge inserted!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users/products:', err);
    process.exit(1);
  }
}

seed(); 