const bcrypt = require('bcryptjs');

// In-memory collections
const users = [];
const destinations = [];
const packages = [];
const itineraries = [];

// Seed default users
const defaultPasswordHash = bcrypt.hashSync('password123', 10);
const adminPasswordHash = bcrypt.hashSync('1234567890', 10);

users.push(
  {
    _id: 'mock-admin-anshu',
    name: 'Anshu Admin',
    email: 'anshu@gmail.com',
    password: adminPasswordHash,
    phone: '+15550101',
    role: 'admin',
    preferences: { theme: 'dark' },
    pastTrips: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock-user-1',
    name: 'Jane Doe',
    email: 'user@travel.com',
    password: defaultPasswordHash,
    phone: '+15550199',
    role: 'user',
    preferences: {
      theme: 'dark',
      interests: ['beach', 'culture'],
      budgetLevel: 'medium'
    },
    pastTrips: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock-admin-1',
    name: 'Admin User',
    email: 'admin@travel.com',
    password: defaultPasswordHash,
    phone: '+15550100',
    role: 'admin',
    preferences: { theme: 'dark' },
    pastTrips: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
);

// Seed default destinations
destinations.push(
  {
    _id: 'mock-dest-paris',
    name: 'Paris',
    city: 'Paris',
    country: 'France',
    description: 'The City of Light, world capital of art, fashion, gastronomy, and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine. Beyond such landmarks as the Eiffel Tower and the 12th-century, Gothic Notre-Dame cathedral, the city is known for its cafe culture and designer boutiques.',
    category: 'luxury',
    tags: ['romantic', 'culture', 'sightseeing', 'art'],
    attractions: [
      { _id: 'mock-attr-eiffel', name: 'Eiffel Tower', description: 'Iconic 1889 iron tower, the global symbol of France.' },
      { _id: 'mock-attr-louvre', name: 'Louvre Museum', description: 'The world\'s largest art museum, home to the Mona Lisa.' },
      { _id: 'mock-attr-seine', name: 'Seine River Cruise', description: 'A relaxing boat cruise down the central river of Paris.' }
    ],
    images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'],
    meta: { popularity: 98, rating: 4.8 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock-dest-tokyo',
    name: 'Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    description: 'Japan\'s bustling capital mixes ultra-modern skyscrapers with historic Shinto shrines and Buddhist temples. From the neon-lit streets of Shinjuku and Akihabara to the quiet gardens of Meiji Shrine, Tokyo offers an incredible juxtaposition of old and new.',
    category: 'adventure',
    tags: ['technology', 'food', 'culture', 'anime'],
    attractions: [
      { _id: 'mock-attr-shibuya', name: 'Shibuya Crossing', description: 'The world\'s busiest pedestrian intersection, a spectacular sight.' },
      { _id: 'mock-attr-sensoji', name: 'Senso-ji Temple', description: 'Tokyo\'s oldest and most significant Buddhist temple in Asakusa.' },
      { _id: 'mock-attr-skytree', name: 'Tokyo Skytree', description: 'The tallest structure in Japan, offering panoramic views.' }
    ],
    images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'],
    meta: { popularity: 95, rating: 4.9 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock-dest-bali',
    name: 'Bali',
    city: 'Denpasar',
    country: 'Indonesia',
    description: 'Bali is a tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple. To the south, the beachside city of Kuta has lively bars, while Seminyak, Sanur and Nusa Dua are popular resort towns.',
    category: 'budget',
    tags: ['beach', 'relaxation', 'nature', 'spiritual'],
    attractions: [
      { _id: 'mock-attr-uluwatu', name: 'Uluwatu Temple', description: 'A magnificent clifftop sea temple overlooking the Indian Ocean.' },
      { _id: 'mock-attr-ubud', name: 'Tegallalang Rice Terraces', description: 'Beautiful terraced slopes famous for their traditional irrigation.' },
      { _id: 'mock-attr-monkey', name: 'Sacred Monkey Forest Sanctuary', description: 'A nature reserve and temple complex inhabited by macaques.' }
    ],
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'],
    meta: { popularity: 92, rating: 4.7 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock-dest-nyc',
    name: 'New York City',
    city: 'New York',
    country: 'United States',
    description: 'New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that\'s among the world\'s major commercial, financial and cultural centers. Its iconic sites include skyscrapers such as the Empire State Building and sprawling Central Park.',
    category: 'family',
    tags: ['sightseeing', 'shopping', 'theater', 'city'],
    attractions: [
      { _id: 'mock-attr-statue', name: 'Statue of Liberty', description: 'The famous copper statue welcoming immigrants and visitors.' },
      { _id: 'mock-attr-times', name: 'Times Square', description: 'The neon-bright heart of the Broadway theater district.' },
      { _id: 'mock-attr-central', name: 'Central Park', description: 'An expansive urban park with walking paths, lakes, and zoo.' }
    ],
    images: ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80'],
    meta: { popularity: 96, rating: 4.6 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
);

// Seed default packages
packages.push(
  {
    _id: 'mock-pkg-paris',
    title: 'Romantic Paris Getaway',
    slug: 'romantic-paris-getaway',
    destination: 'mock-dest-paris', // key to populating
    price: 120000,
    currency: 'INR',
    durationDays: 5,
    itinerarySummary: [
      'Day 1: Arrival, VIP Airport Pickup, and Luxury Hotel Check-In',
      'Day 2: Private Louvre Guided Tour & Evening Seine River Champagne Dinner Cruise',
      'Day 3: Eiffel Tower Access, Summit Visit, and Michelin-Starred Lunch',
      'Day 4: Day Trip to Palace of Versailles with Private Carriage Ride',
      'Day 5: Pastry Baking Class and Departure Transfer'
    ],
    description: 'Indulge in the ultimate romantic vacation in the City of Light. This meticulously curated package includes 5-star hotel accommodations, daily gourmet breakfasts, private expert guides at the Louvre and Eiffel Tower, and high-end experiences designed to create lifelong memories.',
    category: 'luxury',
    tags: ['romantic', 'luxury', 'art', 'honeymoon'],
    images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'],
    availableDates: [new Date(2026, 6, 1), new Date(2026, 7, 15)],
    createdBy: 'mock-admin-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock-pkg-tokyo',
    title: 'Tokyo Tech & Tradition Explorer',
    slug: 'tokyo-tech-tradition-explorer',
    destination: 'mock-dest-tokyo',
    price: 150000,
    currency: 'INR',
    durationDays: 7,
    itinerarySummary: [
      'Day 1: Welcome to Tokyo - Evening Shinjuku Neon Walk',
      'Day 2: Historical Asakusa Tour & Sensoji Temple Visit',
      'Day 3: Shibuya Crossing Walk, Harajuku Shopping & Meiji Shrine',
      'Day 4: Akihabara Electronics & Anime Town Exploration',
      'Day 5: Digital Art Museum visit & Odaiba Futuristic District',
      'Day 6: Sushi Making Masterclass & Craft Beer Tasting in Shibuya',
      'Day 7: Farewell Tokyo - Departure Transfer'
    ],
    description: 'Experience the stunning contrast of Tokyo. Tour ancient, peaceful Buddhist temples and shrines in the morning, and explore bright neon lights, cutting-edge consumer robotics, and digital art museums in the afternoon. Includes premium lodging, guides, and transit pass.',
    category: 'adventure',
    tags: ['technology', 'culture', 'food', 'adventure'],
    images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'],
    availableDates: [new Date(2026, 8, 10), new Date(2026, 9, 20)],
    createdBy: 'mock-admin-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock-pkg-bali',
    title: 'Budget Bali Beach & Rice Terraces',
    slug: 'budget-bali-beach-rice-terraces',
    destination: 'mock-dest-bali',
    price: 55000,
    currency: 'INR',
    durationDays: 6,
    itinerarySummary: [
      'Day 1: Arrival & Check-In at Cozy Ubud Eco-Bungalow',
      'Day 2: Sacred Monkey Forest Sanctuary & Tegallalang Rice Fields Tour',
      'Day 3: Sunrise Volcano Hike at Mount Batur with Hot Springs Refresh',
      'Day 4: Cliffside Uluwatu Temple & Beach BBQ Dinner',
      'Day 5: Traditional Balinese Spa Treatment & Free Afternoon in Kuta',
      'Day 6: Souvenir Shopping and Departure'
    ],
    description: 'An affordable tropical getaway designed for budget-conscious travelers who want the complete Bali experience. Discover lush rice fields, stunning ocean cliffs, volcanic sunrises, and rich Hindu culture. Lodging in highly-rated eco-bungalows with breakfast included.',
    category: 'budget',
    tags: ['beach', 'relaxation', 'nature', 'budget'],
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'],
    availableDates: [new Date(2026, 5, 5), new Date(2026, 6, 12)],
    createdBy: 'mock-admin-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
);

// Populate utility helper
function populateDestination(pkg) {
  if (!pkg) return pkg;
  const d = destinations.find(dest => dest._id === pkg.destination);
  return { ...pkg, destination: d || null };
}

module.exports = {
  // Users
  users,
  getUserById: async (id) => users.find(u => u._id === id),
  getUserByEmail: async (email) => users.find(u => u.email === email),
  getUserByPhone: async (phone) => users.find(u => u.phone === phone),
  createUser: async (userData) => {
    const newUser = {
      _id: `mock-user-${Date.now()}`,
      name: userData.name || '',
      email: userData.email,
      password: userData.password ? await bcrypt.hash(userData.password, 10) : undefined,
      phone: userData.phone,
      role: userData.role || 'user',
      preferences: userData.preferences || {},
      pastTrips: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },
  updateUserPreferences: async (id, prefs) => {
    const userIndex = users.findIndex(u => u._id === id);
    if (userIndex === -1) return null;
    users[userIndex].preferences = Object.assign({}, users[userIndex].preferences, prefs);
    users[userIndex].updatedAt = new Date();
    return users[userIndex];
  },

  // Destinations
  destinations,
  getDestinations: async (filter = {}) => {
    let result = [...destinations];
    const { q, category, tag } = filter;
    if (category) {
      result = result.filter(d => d.category === category);
    }
    if (tag) {
      result = result.filter(d => d.tags.includes(tag));
    }
    if (q) {
      const searchStr = q.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(searchStr) ||
        d.city.toLowerCase().includes(searchStr) ||
        d.country.toLowerCase().includes(searchStr) ||
        d.description.toLowerCase().includes(searchStr)
      );
    }
    return result;
  },
  getDestinationById: async (id) => destinations.find(d => d._id === id),
  createDestination: async (destData) => {
    const newDest = {
      _id: `mock-dest-${Date.now()}`,
      ...destData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    destinations.push(newDest);
    return newDest;
  },
  updateDestination: async (id, destData) => {
    const idx = destinations.findIndex(d => d._id === id);
    if (idx === -1) return null;
    destinations[idx] = { ...destinations[idx], ...destData, updatedAt: new Date() };
    return destinations[idx];
  },
  deleteDestination: async (id) => {
    const idx = destinations.findIndex(d => d._id === id);
    if (idx === -1) return false;
    destinations.splice(idx, 1);
    return true;
  },

  // Packages
  packages,
  getPackages: async (filter = {}) => {
    let result = [...packages];
    const { q, category, tag } = filter;
    if (category) {
      result = result.filter(p => p.category === category);
    }
    if (tag) {
      result = result.filter(p => p.tags.includes(tag));
    }
    if (q) {
      const searchStr = q.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchStr) ||
        p.description.toLowerCase().includes(searchStr)
      );
    }
    // Return populated
    return result.map(populateDestination);
  },
  getPackageById: async (id) => {
    const p = packages.find(p => p._id === id);
    return populateDestination(p);
  },
  createPackage: async (pkgData) => {
    const newPkg = {
      _id: `mock-pkg-${Date.now()}`,
      ...pkgData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    packages.push(newPkg);
    return populateDestination(newPkg);
  },
  updatePackage: async (id, pkgData) => {
    const idx = packages.findIndex(p => p._id === id);
    if (idx === -1) return null;
    packages[idx] = { ...packages[idx], ...pkgData, updatedAt: new Date() };
    return populateDestination(packages[idx]);
  },
  deletePackage: async (id) => {
    const idx = packages.findIndex(p => p._id === id);
    if (idx === -1) return false;
    packages.splice(idx, 1);
    return true;
  },

  // Itineraries
  itineraries,
  getItineraryById: async (id) => {
    const it = itineraries.find(i => i._id === id);
    if (!it) return null;
    // Mock populate owner & collaborators
    const ownerObj = users.find(u => u._id === it.owner);
    const collabObjs = (it.collaborators || []).map(cid => users.find(u => u._id === cid)).filter(Boolean);
    return {
      ...it,
      owner: ownerObj || { _id: it.owner, name: 'Guest User' },
      collaborators: collabObjs
    };
  },
  createItinerary: async (itData) => {
    const newIt = {
      _id: `mock-itin-${Date.now()}`,
      days: [],
      collaborators: [],
      isPublic: false,
      estimatedCost: 0,
      estimatedTimeMinutes: 0,
      ...itData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    itineraries.push(newIt);
    return newIt;
  },
  updateItinerary: async (id, itData) => {
    const idx = itineraries.findIndex(i => i._id === id);
    if (idx === -1) return null;
    // Exclude owner/sharedToken changes unless explicitly allowed
    const { _id, owner, sharedToken, ...updatable } = itData;
    itineraries[idx] = { ...itineraries[idx], ...updatable, updatedAt: new Date() };
    return itineraries[idx];
  },
  getItineraryByToken: async (token) => itineraries.find(i => i.sharedToken === token)
};
