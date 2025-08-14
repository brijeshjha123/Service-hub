const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// ✅ MIDDLEWARE to parse incoming JSON
app.use(cors());
app.use(express.json()); // <--- ADD THIS LINE

// ROUTES
app.use('/api/auth', authRoutes);
console.log("Auth routes loaded");

app.get('/test', (req, res) => {
  res.send('Server working!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
