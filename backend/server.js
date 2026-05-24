require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const destRoutes = require('./routes/destinations');
const pkgRoutes = require('./routes/packages');
const itinRoutes = require('./routes/itineraries');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destRoutes);
app.use('/api/packages', pkgRoutes);
app.use('/api/itineraries', itinRoutes);

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.warn("MONGO_URI is not set. Skipping MongoDB connection.");
      return;
    }

    console.log("Attempting MongoDB connection ");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected successfully");

  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.warn("Continuing without DB connection (development fallback). Some features will be disabled.");
  }

  // Start the server whether DB is connected or not
  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  // Optional: handle server errors (like port already in use)
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Try a different port.`);
    } else {
      console.error("Server error:", err);
    }
  });
}
start();
