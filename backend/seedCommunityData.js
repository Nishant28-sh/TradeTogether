const mongoose = require('mongoose');
const User = require('./models/User');
const Community = require('./models/Community');
const Challenge = require('./models/Challenge');
const Announcement = require('./models/Announcement');
const Wishlist = require('./models/Wishlist');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleUsers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: '$2a$10$example.hash',
    skills: ['Pottery', 'Ceramics', 'Sculpting'],
    location: 'Portland, OR',
    isArtisan: true,
    artisanLevel: 'Expert',
    yearsOfExperience: 8,
    specialties: ['Wheel Throwing', 'Glazing'],
    isVerified: true,
    ratings: 4.8,
    totalTrades: 45,
    successfulTrades: 42,
    communityPoints: 1250,
    badges: [
      { name: 'Master Potter', description: 'Completed 50+ pottery trades', icon: '🏺' },
      { name: 'Community Leader', description: 'Created 3+ communities', icon: '👑' }
    ]
  },
  {
    name: 'Mike Chen',
    email: 'mike@example.com',
    password: '$2a$10$example.hash',
    skills: ['Woodworking', 'Carpentry', 'Furniture Making'],
    location: 'Seattle, WA',
    isArtisan: true,
    artisanLevel: 'Master',
    yearsOfExperience: 12,
    specialties: ['Fine Furniture', 'Joinery'],
    isVerified: true,
    ratings: 4.9,
    totalTrades: 67,
    successfulTrades: 65,
    communityPoints: 2100,
    badges: [
      { name: 'Wood Master', description: 'Completed 100+ woodworking trades', icon: '🪵' },
      { name: 'Verified Artisan', description: 'Verified by platform', icon: '✅' }
    ]
  },
  {
    name: 'Emma Rodriguez',
    email: 'emma@example.com',
    password: '$2a$10$example.hash',
    skills: ['Jewelry Making', 'Metalwork', 'Beading'],
    location: 'Austin, TX',
    isArtisan: true,
    artisanLevel: 'Intermediate',
    yearsOfExperience: 4,
    specialties: ['Wire Wrapping', 'Chain Maille'],
    isVerified: true,
    ratings: 4.6,
    totalTrades: 23,
    successfulTrades: 22,
    communityPoints: 780,
    badges: [
      { name: 'Jewelry Artist', description: 'Completed 20+ jewelry trades', icon: '💎' }
    ]
  }
];

const sampleCommunities = [
  {
    name: 'Pottery Masters',
    description: 'A community for pottery enthusiasts and ceramic artists. Share techniques, showcase work, and trade pottery supplies.',
    category: 'Pottery',
    image: 'uploads/pottery-community.jpg',
    rules: [
      'Be respectful of all skill levels',
      'Share your knowledge generously',
      'No spam or self-promotion',
      'Keep discussions relevant to pottery'
    ],
    featuredArtisans: [],
    isPrivate: false
  },
  {
    name: 'Woodworkers United',
    description: 'Connect with fellow woodworkers, share project ideas, and trade tools and materials.',
    category: 'Crafts',
    image: 'uploads/woodworking-community.jpg',
    rules: [
      'Share safety tips and best practices',
      'Show off your projects',
      'Help beginners with advice',
      'Trade tools and materials fairly'
    ],
    featuredArtisans: [],
    isPrivate: false
  },
  {
    name: 'Jewelry Creators',
    description: 'A vibrant community for jewelry makers of all levels. Share techniques, materials, and finished pieces.',
    category: 'Jewelry',
    image: 'uploads/jewelry-community.jpg',
    rules: [
      'Share your creative process',
      'Ask for feedback on designs',
      'Trade beads, wire, and findings',
      'Support fellow artisans'
    ],
    featuredArtisans: [],
    isPrivate: false
  }
];

const sampleChallenges = [
  {
    title: 'Winter Pottery Challenge',
    description: 'Create a unique winter-themed pottery piece. Whether it\'s a cozy mug or a decorative snowflake ornament, let the season inspire your creativity!',
    category: 'Seasonal',
    theme: 'Winter Vibes',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-01-31'),
    isActive: true,
    maxParticipants: 50,
    rules: [
      'Must be handcrafted pottery',
      'Incorporate summer themes or colors',
      'Share your process photos',
      'Submit final piece by January 31st'
    ],
    requirements: [
      'Wheel-thrown or hand-built piece',
      'Winter-inspired design',
      'Process documentation',
      'Final photos from multiple angles'
    ],
    prizes: [
      { rank: 1, description: 'Premium Pottery Tool Set', points: 500, badge: 'Winter Master' },
      { rank: 2, description: 'Clay and Glaze Package', points: 300, badge: 'Winter Artist' },
      { rank: 3, description: 'Community Recognition', points: 200, badge: 'Winter Creator' }
    ],
    tags: ['pottery', 'winter', 'seasonal', 'creative'],
    difficulty: 'Intermediate'
  },
  {
    title: 'Upcycled Furniture Challenge',
    description: 'Transform old furniture into something beautiful and functional. Show us your upcycling skills!',
    category: 'Monthly',
    theme: 'Upcycling',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-01-15'),
    isActive: true,
    maxParticipants: 30,
    rules: [
      'Must use existing furniture as base',
      'Document before and after',
      'Explain your process',
      'Show sustainability aspects'
    ],
    requirements: [
      'Before and after photos',
      'Process documentation',
      'Materials list',
      'Sustainability explanation'
    ],
    prizes: [
      { rank: 1, description: 'Professional Tool Kit', points: 400, badge: 'Upcycling Master' },
      { rank: 2, description: 'Woodworking Supplies', points: 250, badge: 'Upcycling Artist' },
      { rank: 3, description: 'Community Spotlight', points: 150, badge: 'Upcycling Creator' }
    ],
    tags: ['woodworking', 'upcycling', 'furniture', 'sustainability'],
    difficulty: 'Advanced'
  }
];

const sampleAnnouncements = [
  {
    title: 'New Community Features Released!',
    content: 'We\'re excited to announce the launch of our new community features including challenges, wishlists, and enhanced user profiles. Check them out and start engaging with fellow artisans!',
    type: 'Feature Announcement',
    priority: 'High',
    isPinned: true,
    targetAudience: 'All Users',
    tags: ['features', 'community', 'update']
  },
  {
    title: '1000 Successful Trades Milestone!',
    content: 'Congratulations to our amazing community! We\'ve reached 1000 successful trades. Thank you to all the artisans who make this platform special.',
    type: 'Success Story',
    priority: 'Medium',
    isPinned: false,
    targetAudience: 'All Users',
    tags: ['milestone', 'success', 'community']
  },
  {
    title: 'Safety Guidelines for Trading',
    content: 'Please review our updated safety guidelines for trading. Always meet in public places, verify items before trading, and report any suspicious activity.',
    type: 'Safety Alert',
    priority: 'High',
    isPinned: true,
    targetAudience: 'All Users',
    tags: ['safety', 'guidelines', 'trading']
  }
];

async function seedData() {
  try {
    console.log('🌱 Starting to seed community data...');

    // Clear existing data
    await User.deleteMany({});
    await Community.deleteMany({});
    await Challenge.deleteMany({});
    await Announcement.deleteMany({});
    await Wishlist.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create communities and add users
    for (let i = 0; i < sampleCommunities.length; i++) {
      const community = sampleCommunities[i];
      community.members = createdUsers.map(user => user._id);
      community.admins = [createdUsers[0]._id]; // First user as admin
      community.featuredArtisans = createdUsers.slice(0, 2).map(user => user._id);
    }

    const createdCommunities = await Community.insertMany(sampleCommunities);
    console.log(`🏘️ Created ${createdCommunities.length} communities`);

    // Create challenges
    for (let i = 0; i < sampleChallenges.length; i++) {
      const challenge = sampleChallenges[i];
      challenge.createdBy = createdUsers[0]._id;
      challenge.participants = createdUsers.map(user => user._id);
      challenge.community = createdCommunities[i % createdCommunities.length]._id;
    }

    const createdChallenges = await Challenge.insertMany(sampleChallenges);
    console.log(`🏆 Created ${createdChallenges.length} challenges`);

    // Create announcements
    for (let i = 0; i < sampleAnnouncements.length; i++) {
      const announcement = sampleAnnouncements[i];
      announcement.createdBy = createdUsers[0]._id;
    }

    const createdAnnouncements = await Announcement.insertMany(sampleAnnouncements);
    console.log(`📢 Created ${createdAnnouncements.length} announcements`);

    // Create wishlists for users
    const wishlists = createdUsers.map(user => ({
      user: user._id,
      wishlistItems: [
        {
          title: 'Pottery Wheel',
          description: 'Looking for a good quality pottery wheel for beginners',
          category: 'Pottery Tools',
          priority: 'High',
          tags: ['pottery', 'wheel', 'tools']
        },
        {
          title: 'Wood Chisels Set',
          description: 'Professional wood chisels for fine woodworking',
          category: 'Woodworking Tools',
          priority: 'Medium',
          tags: ['woodworking', 'chisels', 'tools']
        }
      ],
      inspirationBoards: [
        {
          name: 'Pottery Inspiration',
          description: 'Beautiful pottery designs and techniques',
          isPublic: true,
          items: []
        },
        {
          name: 'Furniture Ideas',
          description: 'Modern furniture designs and woodworking projects',
          isPublic: true,
          items: []
        }
      ]
    }));

    await Wishlist.insertMany(wishlists);
    console.log(`💝 Created wishlists for ${createdUsers.length} users`);

    console.log('✅ Community data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Communities: ${createdCommunities.length}`);
    console.log(`   - Challenges: ${createdChallenges.length}`);
    console.log(`   - Announcements: ${createdAnnouncements.length}`);
    console.log(`   - Wishlists: ${wishlists.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData(); 