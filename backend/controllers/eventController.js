const Event = require('../models/Event');
const User = require('../models/User');

// Get all events (public)
exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, status = 'Published' } = req.query;
    
    const filter = { isActive: true, status };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const events = await Event.find(filter)
      .populate('createdBy', 'name profilePhoto')
      .populate('organizers', 'name profilePhoto')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured events
exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      isActive: true, 
      isFeatured: true, 
      status: 'Published',
      date: { $gte: new Date() }
    })
    .populate('createdBy', 'name profilePhoto')
    .sort({ date: 1 })
    .limit(6);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name profilePhoto email')
      .populate('organizers', 'name profilePhoto')
      .populate('participants', 'name profilePhoto');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new event (admin only)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      date,
      endDate,
      location,
      maxParticipants,
      tags,
      category,
      price,
      registrationDeadline,
      requirements,
      highlights,
      contactInfo,
      socialLinks,
      status
    } = req.body;

    const event = new Event({
      title,
      description,
      type,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      location: location ? JSON.parse(location) : {},
      maxParticipants,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      category,
      price: price ? JSON.parse(price) : { amount: 0, currency: 'USD', isFree: true },
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      requirements: requirements ? requirements.split('\n').map(r => r.trim()).filter(Boolean) : [],
      highlights: highlights ? highlights.split('\n').map(h => h.trim()).filter(Boolean) : [],
      contactInfo: contactInfo ? JSON.parse(contactInfo) : {},
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      status,
      createdBy: req.user.id,
      organizers: [req.user.id]
    });

    // Handle image upload
    if (req.file) {
      event.image = req.file.path;
    }

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update event (admin only)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Parse complex fields
    if (updateData.location) {
      updateData.location = JSON.parse(updateData.location);
    }
    if (updateData.price) {
      updateData.price = JSON.parse(updateData.price);
    }
    if (updateData.contactInfo) {
      updateData.contactInfo = JSON.parse(updateData.contactInfo);
    }
    if (updateData.socialLinks) {
      updateData.socialLinks = JSON.parse(updateData.socialLinks);
    }
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }
    if (updateData.requirements) {
      updateData.requirements = updateData.requirements.split('\n').map(r => r.trim()).filter(Boolean);
    }
    if (updateData.highlights) {
      updateData.highlights = updateData.highlights.split('\n').map(h => h.trim()).filter(Boolean);
    }

    // Handle dates
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.registrationDeadline) {
      updateData.registrationDeadline = new Date(updateData.registrationDeadline);
    }

    // Handle image upload
    if (req.file) {
      updateData.image = req.file.path;
    }

    const event = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name profilePhoto');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete event (admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register for event
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isActive || event.status !== 'Published') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }

    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    event.participants.push(userId);
    await event.save();

    res.json({ message: 'Registered for event successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unregister from event
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const participantIndex = event.participants.indexOf(userId);
    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    event.participants.splice(participantIndex, 1);
    await event.save();

    res.json({ message: 'Unregistered from event successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get events by creator (admin)
exports.getEventsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const events = await Event.find({ createdBy: creatorId })
      .populate('createdBy', 'name profilePhoto')
      .populate('participants', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's registered events
exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const registeredEvents = await Event.find({
      participants: userId,
      isActive: true
    })
    .populate('createdBy', 'name profilePhoto')
    .sort({ date: 1 });

    const createdEvents = await Event.find({
      createdBy: userId
    })
    .populate('participants', 'name profilePhoto')
    .sort({ createdAt: -1 });

    res.json({
      registered: registeredEvents,
      created: createdEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle event featured status (admin only)
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.isFeatured = !event.isFeatured;
    await event.save();

    res.json({ message: `Event ${event.isFeatured ? 'featured' : 'unfeatured'} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 