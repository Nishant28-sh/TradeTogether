const mongoose = require('mongoose');
const Community = require('./models/Community');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skill-exchange';

const communities = [
  {
    name: 'Woodworking Artists',
    description: 'For creators who love carving, building, and working with wood.',
    image: '',
  },
  {
    name: 'Sewing & Fabric Craft',
    description: 'A community for people who sew, quilt, and create fabric magic.',
    image: '',
  },
  {
    name: 'Eco-Friendly Upcyclers',
    description: 'For those who transform waste into beautiful, useful items.',
    image: '',
  },
  {
    name: 'DIY Electronics & Gadgets',
    description: 'A space for electronics tinkerers and repair wizards.',
    image: '',
  },
  {
    name: 'Painting & Artisans',
    description: 'Connect with painters and decorative artists to share, trade, and learn.',
    image: '',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await Community.deleteMany({});
    await Community.insertMany(communities);
    console.log('Sample communities inserted!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding communities:', err);
    process.exit(1);
  }
}

seed(); 