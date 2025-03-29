
import express from 'express';
import cors from 'cors';


import runnerRoutes from './routes/runner';
import dashboardRoutes from './routes/dashboard';
const app = express();
const PORT = process.env.PORT || 3069;

// Middleware
const corsOptions = {
  origin: '*', // Allow all origins temporarily for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200,
  credentials: false // Changed to false since we're using '*'
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes

app.use('/api/dashboard',dashboardRoutes);
app.use('/api/runner',runnerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is up and running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



