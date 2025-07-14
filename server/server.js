const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/Authroutes');
const taskRoutes = require('./routes/taskrouter');
const passportConfig = require('./config/Passport');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e6,
  allowRequest: (req, callback) => {
    // Add cache-control header for WebSocket upgrade requests
    if (req.headers.upgrade === 'websocket') {
      req.headers['cache-control'] = 'no-cache';
    }
    callback(null, true);
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());

// Rate limiting - separate limiters for different routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs for auth routes
  message: 'Too many authentication requests, please try again later.',
  skipSuccessfulRequests: true
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for general routes
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to specific routes (excluding OAuth)
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/signin', authLimiter);
app.use('/api/tasks', generalLimiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
};
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Session configuration
app.use(session({ 
  secret: process.env.JWT_SECRET || 'fallback-secret-key', 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// Socket.IO route handler with proper headers
app.use('/socket.io', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// WebSocket middleware for headers and authentication
io.use((socket, next) => {
  // Set cache-control header for WebSocket connections
  if (socket.handshake.headers.upgrade === 'websocket') {
    socket.handshake.headers['cache-control'] = 'no-cache';
  }
  
  const token = socket.handshake.auth.token;
  
  if (!token) {
    // Allow connection without authentication for public events
    socket.userId = null;
    socket.authenticated = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.authenticated = true;
    next();
  } catch (error) {
    console.error('WebSocket authentication error:', error.message);
    // Allow connection but mark as unauthenticated
    socket.userId = null;
    socket.authenticated = false;
    next();
  }
});

io.on('connection', (socket) => {
  if (socket.authenticated) {
    console.log(`Authenticated user connected: ${socket.userId}`);
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
  } else {
    console.log('Unauthenticated user connected');
  }

  socket.on('disconnect', () => {
    if (socket.authenticated) {
      console.log(`Authenticated user disconnected: ${socket.userId}`);
    } else {
      console.log('Unauthenticated user disconnected');
    }
  });

  // Handle authentication events
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.authenticated = true;
      socket.join(`user_${socket.userId}`);
      socket.emit('authenticated', { userId: socket.userId });
      console.log(`User authenticated via socket: ${socket.userId}`);
    } catch (error) {
      socket.emit('authentication_error', { message: 'Invalid token' });
    }
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection and server startup
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
})
.catch(err => {
  console.error('DB connection failed:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});