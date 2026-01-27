# Appointment App Backend

A Node.js backend API for the appointment booking application with MySQL database integration.

## Features

- **User Management**: Complete user CRUD operations with role-based access control
- **Appointment System**: Full appointment lifecycle management
- **Service Management**: Service catalog with categories and pricing
- **Authentication**: JWT-based authentication with role-based permissions
- **Database Integration**: MySQL database with connection pooling
- **API Documentation**: RESTful API with comprehensive endpoints
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Comprehensive error handling and logging

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Joi** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

## Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd appointment-app/back-end
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=mysql-1f0279f2-thinira-9435.b.aivencloud.com
   DB_PORT=20513
   DB_USER=avnadmin
   DB_PASSWORD=your-database-password
   DB_NAME=appointment_app

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   ```bash
   # Initialize database tables
   node scripts/initDatabase.js
   
   # Seed database with sample data
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user profile
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/overview` - Get user statistics

### Appointments
- `GET /api/appointments` - Get all appointments (with filters)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `PATCH /api/appointments/:id/status` - Update appointment status
- `PATCH /api/appointments/:id/payment` - Update payment status

### Services
- `GET /api/services` - Get all services (with filters)
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/search/:searchTerm` - Search services

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/active` - Get active categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Database Schema

### Users Table
- User information with role-based access control
- JSON fields for specializations, preferences, permissions
- Support for emergency contacts and user statistics

### Appointments Table
- Complete appointment lifecycle management
- Client, provider, and company relationships
- Payment and status tracking

### Services Table
- Service catalog with pricing and duration
- Category and subcategory classification
- Provider information and booking statistics

### Categories Table
- Hierarchical category system
- Support for subcategories
- Company count tracking

## Authentication & Authorization

### User Roles
- **Super Admin (Level 0)**: Full system access
- **Company Owner (Level 1)**: Company management
- **Staff Member (Level 2)**: Appointment and client management
- **User (Level 3)**: Basic user access

### Permissions
- Role-based permission system
- Company-scoped access control
- Resource ownership validation

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Joi schema validation
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Protection**: Parameterized queries

## Error Handling

- Comprehensive error handling middleware
- Structured error responses
- Development vs production error details
- Database error mapping

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed database with sample data

### Database Management
- `node scripts/initDatabase.js` - Create database tables
- `node scripts/seedDatabase.js` - Seed with sample data

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | Required |
| `DB_PORT` | Database port | 3306 |
| `DB_USER` | Database username | Required |
| `DB_PASSWORD` | Database password | Required |
| `DB_NAME` | Database name | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRES_IN` | Token expiration | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

