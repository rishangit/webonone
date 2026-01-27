# 🚀 Quick Start Guide

## One-Command Setup & Run

### Option 1: Using npm (Recommended)
```bash
# Complete setup and start both applications
npm run setup && npm run dev
```

### Option 2: Using batch/shell scripts
**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
./start.sh
```

## 📋 What This Does

The setup process will:

1. **Install Dependencies**
   - Install root dependencies (concurrently)
   - Install frontend dependencies (React, TypeScript, etc.)
   - Install backend dependencies (Express, MySQL, etc.)

2. **Database Setup**
   - Connect to your MySQL database
   - Create all necessary tables
   - Seed with sample data from your frontend JSON files

3. **Start Applications**
   - Frontend: http://localhost:3007
   - Backend: http://localhost:5007

## 🎯 Available Commands

### Development Commands
```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend  
npm run dev:backend
```

### Setup Commands
```bash
# Install all dependencies
npm run install:all

# Set up database only
npm run setup:backend

# Complete setup (install + database)
npm run setup
```

### Production Commands
```bash
# Build and start both applications
npm run start

# Build frontend only
npm run build

# Start backend only
npm run start:backend
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill processes using ports 5007 and 3007
# Windows:
netstat -ano | findstr :5007
netstat -ano | findstr :3007
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5007 | xargs kill -9
lsof -ti:3007 | xargs kill -9
```

### Database Connection Issues
1. Verify your MySQL database is running
2. Check the database credentials in `back-end/.env`
3. Run `npm run setup:backend` to recreate tables

### Dependencies Issues
```bash
# Clean and reinstall everything
npm run reset
```

## 📱 Application URLs

Once running, you can access:

- **Frontend**: http://localhost:3007
- **Backend API**: http://localhost:5007
- **API Health**: http://localhost:5007/health
- **API Documentation**: http://localhost:5007/

## 🗄️ Database Configuration

The application uses these pre-configured database settings:

- **Host**: mysql-1f0279f2-thinira-9435.b.aivencloud.com
- **Port**: 20513
- **Database**: appapp
- **User**: avnadmin
- **Password**: [Set in .env file]

## 🎉 Success!

If everything is working correctly, you should see:

1. **Frontend** running on http://localhost:3007
2. **Backend** running on http://localhost:5007
3. **Database** connected and seeded with sample data
4. **Both applications** auto-reloading on file changes

## 📞 Need Help?

1. Check the console output for error messages
2. Verify all ports are available
3. Ensure database credentials are correct
4. Run `npm run logs` to see detailed logs from both applications
