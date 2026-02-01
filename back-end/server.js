const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const { testConnection } = require('./config/database');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const appointmentHistoryRoutes = require('./routes/appointmentHistory');
const serviceRoutes = require('./routes/services');
const companyRoutes = require('./routes/companies');
const productRoutes = require('./routes/products');
const companyProductRoutes = require('./routes/companyProducts');
const companyProductVariantRoutes = require('./routes/companyProductVariants');
const companyProductStockRoutes = require('./routes/companyProductStock');
const tagRoutes = require('./routes/tags');
const salesRoutes = require('./routes/sales');
const currencyRoutes = require('./routes/currencies');
const companyWebThemeRoutes = require('./routes/companyWebThemes');
const companyUsersRoutes = require('./routes/companyUsers');
console.log('Loading uploads routes...');
const uploadRoutes = require('./routes/uploads');
console.log('Uploads routes loaded successfully');

const app = express();
const PORT = process.env.PORT || 5007;

// Security middleware - configure helmet to allow cross-origin images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:5007", "http://localhost:3007", "http://localhost:5173", "http:"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3007',  // Current frontend port
      'http://localhost:5173',  // Default Vite port
      'http://185.116.237.5:3007',  // Remote server frontend
      'http://www.webonone.com',
      'https://www.webonone.com',
      'http://webonone.com',
      'https://webonone.com',
      process.env.FRONTEND_URL || 'http://localhost:3007'
    ];
    
    // Also allow any origin that matches the pattern for the remote server
    const remoteServerPattern = /^http(s)?:\/\/185\.116\.237\.5(:\d+)?$/;
    const webononePattern = /^http(s)?:\/\/(www\.)?webonone\.com$/;
    
    if (allowedOrigins.includes(origin) || remoteServerPattern.test(origin) || webononePattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting - disabled in development, enabled in production
const isDevelopment = process.env.NODE_ENV === 'development';

if (!isDevelopment) {
  const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 2000; // 2000 requests in production

  const limiter = rateLimit({
    windowMs: rateLimitWindow,
    max: rateLimitMax,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health check endpoint
    skip: (req) => req.path === '/health',
  });

  app.use(limiter);
  console.log('✅ Rate limiting enabled for production environment');
} else {
  console.log('⚠️  Rate limiting disabled for development environment');
}

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads with proper CORS headers
// This middleware removes helmet's restrictive headers and sets CORS headers
app.use('/uploads', (req, res, next) => {
  // Remove helmet's restrictive cross-origin headers
  res.removeHeader('Cross-Origin-Resource-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  res.removeHeader('Cross-Origin-Opener-Policy');
  
  // Set CORS headers explicitly
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3007',
    'http://localhost:5173',
    'http://185.116.237.5:3007',
    'http://www.webonone.com',
    'https://www.webonone.com',
    'http://webonone.com',
    'https://webonone.com'
  ];
  const remoteServerPattern = /^http(s)?:\/\/185\.116\.237\.5(:\d+)?$/;
  const webononePattern = /^http(s)?:\/\/(www\.)?webonone\.com$/;
  
  if (origin && (allowedOrigins.includes(origin) || remoteServerPattern.test(origin) || webononePattern.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}, cors(corsOptions), express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set content type for image files
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) {
      res.setHeader('Content-Type', `image/${ext}`);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/appointment-history', appointmentHistoryRoutes);
const companySalesRoutes = require('./routes/companySales');
app.use('/api/company-sales', companySalesRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-variants', require('./routes/productVariants'));
app.use('/api/company-products', companyProductRoutes);
app.use('/api/company-product-variants', companyProductVariantRoutes);
app.use('/api/company-product-stock', companyProductStockRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/company-web-themes', companyWebThemeRoutes);
app.use('/api/spaces', require('./routes/spaces'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api', companyUsersRoutes);
console.log('Registering uploads routes...');
app.use('/api/uploads', uploadRoutes);
console.log('Uploads routes registered successfully');

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Appointment App API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      appointments: '/api/appointments',
      services: '/api/services',
      health: '/health'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('📝 Available endpoints:');
      console.log('   - GET  /health');
      console.log('   - POST /api/auth/register');
      console.log('   - POST /api/auth/login');
      console.log('   - GET  /api/users');
      console.log('   - GET  /api/appointments');
      console.log('   - GET  /api/services');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
