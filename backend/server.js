const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database Connection
connectDB();

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/shelves', require('./routes/shelfRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
