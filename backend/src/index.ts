require('dotenv').config();
import express, { Request, Response } from "express";
const cors = require('cors');
const morgan = require('morgan');
import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin.route';
import testRoutes from './routes/test.route';
import connectDB from "./db";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Database connection
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Server is running");
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});

export default app;