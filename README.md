# Appointment App - Full Stack Application

A complete appointment booking application with React frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MySQL database

### One-Command Setup & Run

```bash
# Install all dependencies and start both frontend and backend
npm run setup && npm run dev
```

This single command will:
1. Install all dependencies for both frontend and backend
2. Set up the database with tables and sample data
3. Start both the React frontend (port 5173) and Node.js backend (port 3001)

## 📋 Available Commands

### Development
```bash
# Start both frontend and backend in development mode
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend
```

### Production
```bash
# Build and start both applications
npm run start

# Start only frontend (production build)
npm run start:frontend

# Start only backend
npm run start:backend
```

### Setup & Installation
```bash
# Install all dependencies
npm run install:all

# Set up database (creates tables and seeds data)
npm run setup:backend

# Complete setup (install + database setup)
npm run setup
```

### Testing
```bash
# Run tests for both frontend and backend
npm run test

# Run only frontend tests
npm run test:frontend

# Run only backend tests
npm run test:backend
```

### Maintenance
```bash
# Clean all node_modules
npm run clean

# Reset everything (clean + reinstall)
npm run reset

# Run linting for both projects
npm run lint
```

## 🏗️ Project Structure

```
appointment-app/
├── front-end/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript type definitions
│   │   └── jsondb/           # Sample data files
│   ├── package.json
│   └── vite.config.ts
├── back-end/                  # Node.js + Express backend
│   ├── config/                # Database configuration
│   ├── middleware/           # Express middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── scripts/              # Database setup scripts
│   ├── server.js             # Main server file
│   └── package.json
├── package.json               # Root package.json
└── README.md
```

## 🌐 Application URLs

- **Frontend**: http://localhost:3007
- **Backend API**: http://localhost:5007
- **API Health Check**: http://localhost:5007/health

## 🗄️ Database Configuration

The application is pre-configured with the following database settings:

- **Host**: mysql-1f0279f2-thinira-9435.b.aivencloud.com
- **Port**: 20513
- **Database**: appapp
- **User**: avnadmin

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Core Endpoints
- `GET /api/users` - Get all users
- `GET /api/appointments` - Get all appointments
- `GET /api/services` - Get all services
- `GET /api/categories` - Get all categories

## 🛠️ Development Workflow

### First Time Setup
1. Clone the repository
2. Run `npm run setup` to install dependencies and set up the database
3. Run `npm run dev` to start both applications

### Daily Development
1. Run `npm run dev` to start both frontend and backend
2. Make changes to either frontend or backend
3. Both applications will auto-reload on changes

### Adding New Features
1. Frontend changes go in `front-end/src/`
2. Backend changes go in `back-end/`
3. Database changes require running `npm run setup:backend`

## 🔧 Troubleshooting

### Port Already in Use
If ports 3001 or 5173 are already in use:
```bash
# Kill processes using these ports
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database Connection Issues
1. Verify database credentials in `back-end/.env`
2. Check if the database server is accessible
3. Run `npm run setup:backend` to recreate tables

### Dependencies Issues
```bash
# Clean and reinstall everything
npm run reset
```

## 📦 Dependencies

### Root Dependencies
- `concurrently` - Run multiple commands simultaneously
- `cross-env` - Cross-platform environment variables

### Frontend Dependencies
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components

### Backend Dependencies
- Express.js
- MySQL2
- JWT authentication
- Joi validation
- Helmet security

## 🚀 Deployment

### Production Build
```bash
# Build both applications
npm run build

# Start in production mode
npm run start
```

### Environment Variables
Create `.env` files in both `front-end/` and `back-end/` directories with production values.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs: `npm run logs`
3. Create an issue in the repository
