# 🔐 Testing Credentials & Login Information

This document contains all the testing credentials and login information for the WebOnOne platform.

## 🚀 Super Admin Access

### **Primary Super Admin**
- **📧 Email:** `admin@appointmentpro.com`
- **🔑 Password:** `SuperAdmin2024!`
- **👤 Role:** System Admin (0)
- **🆔 User ID:** 10
- **🔐 Permissions:** All (*)
- **✅ Status:** Active & Verified

**Access Level:** Full system administration with complete access to all features, users, companies, and system settings.

---

## 👥 Test User Accounts

### **Company Owner**
- **📧 Email:** `john.doe@healthcare.com`
- **🔑 Password:** `Password123!`
- **👤 Role:** Company Owner (1)
- **🏢 Company:** Healthcare Solutions Inc.
- **🔐 Permissions:** Company management, staff management, appointments, analytics

### **Staff Member**
- **📧 Email:** `sarah.johnson@healthcare.com`
- **🔑 Password:** `Password123!`
- **👤 Role:** Staff Member (2)
- **🏢 Company:** Healthcare Solutions Inc.
- **🔐 Permissions:** Appointment management, customer service, basic analytics

### **Regular User**
- **📧 Email:** `mike.wilson@email.com`
- **🔑 Password:** `Password123!`
- **👤 Role:** User (3)
- **🔐 Permissions:** Book appointments, view personal appointments, basic profile management

---

## 🌐 Access URLs

### **Frontend Application**
- **Base URL:** `http://localhost:3007`
- **Login Page:** `http://localhost:3007/system/login`
- **Signup Page:** `http://localhost:3007/system/signup`
- **Dashboard:** `http://localhost:3007/system/dashboard`
- **Profile:** `http://localhost:3007/system/profile`

### **Backend API**
- **Base URL:** `http://localhost:3001`
- **API Documentation:** `http://localhost:3001/api-docs`
- **Health Check:** `http://localhost:3001/health`

---

## 🔑 Role-Based Access Control

### **System Admin (Role: 0)**
- ✅ **Full System Access**
- ✅ **User Management** - Create, edit, delete all users
- ✅ **Company Management** - Manage all companies
- ✅ **System Settings** - Configure platform settings
- ✅ **Analytics & Reports** - Complete data access
- ✅ **Category Management** - System-wide categories
- ✅ **All Appointments** - View and manage all appointments
- ✅ **Billing & Payments** - Full financial access

### **Company Owner (Role: 1)**
- ✅ **Company Management** - Manage own company
- ✅ **Staff Management** - Add/remove staff members
- ✅ **Appointment Management** - All company appointments
- ✅ **Analytics** - Company-specific reports
- ✅ **Service Management** - Company services
- ✅ **Customer Management** - Company customers

### **Staff Member (Role: 2)**
- ✅ **Appointment Management** - Manage assigned appointments
- ✅ **Customer Service** - Customer interactions
- ✅ **Basic Analytics** - Limited reporting
- ✅ **Service Operations** - Service delivery
- ❌ **User Management** - No access
- ❌ **Company Settings** - Limited access

### **User (Role: 3)**
- ✅ **Book Appointments** - Schedule appointments
- ✅ **View Appointments** - Personal appointment history
- ✅ **Profile Management** - Edit personal information
- ✅ **Company Search** - Find service providers
- ❌ **Admin Features** - No administrative access
- ❌ **Staff Management** - No access

---

## 🧪 Testing Scenarios

### **Authentication Testing**
1. **Login Flow**
   - Test login with valid credentials
   - Test login with invalid credentials
   - Test password reset functionality
   - Test session persistence

2. **Registration Flow**
   - Test new user registration
   - Test email validation
   - Test password requirements
   - Test terms acceptance

### **Role-Based Testing**
1. **System Admin Testing**
   - Access all system features
   - Manage users and companies
   - Configure system settings
   - View comprehensive analytics

2. **Company Owner Testing**
   - Manage company profile
   - Add/remove staff members
   - Configure company services
   - View company analytics

3. **Staff Member Testing**
   - Manage appointments
   - Interact with customers
   - View limited analytics
   - Update personal profile

4. **User Testing**
   - Search for companies
   - Book appointments
   - Manage personal appointments
   - Update profile information

---

## 🔒 Security Notes

### **Password Requirements**
- Minimum 6 characters
- Must contain letters and numbers
- Special characters recommended
- Case sensitive

### **Account Security**
- All passwords are hashed using bcrypt
- JWT tokens for session management
- CORS protection enabled
- Input validation on all forms

### **Session Management**
- Tokens expire after 7 days (configurable)
- Automatic logout on token expiration
- Secure token storage in localStorage
- Session restoration on page refresh

---

## 🚀 Quick Start Guide

### **1. Start the Application**
```bash
# Start backend server
cd back-end
npm start

# Start frontend server (in new terminal)
cd front-end
npm run dev
```

### **2. Access the Application**
- Open browser to `http://localhost:3007`
- Navigate to `/system/login`
- Use any of the provided credentials

### **3. Test Different Roles**
- Login as Super Admin for full access
- Login as Company Owner for business features
- Login as Staff Member for operational features
- Login as User for customer features

---

## 📞 Support & Troubleshooting

### **Common Issues**
1. **Login Failed**
   - Verify email and password are correct
   - Check if account is active
   - Ensure backend server is running

2. **Permission Denied**
   - Verify user role has required permissions
   - Check if user is verified
   - Ensure proper role assignment

3. **Session Issues**
   - Clear browser localStorage
   - Check token expiration
   - Restart application

### **Database Reset**
If you need to reset the database with fresh data:
```bash
cd back-end
node scripts/initDatabase.js
node scripts/seedDatabase.js
node scripts/addSuperAdmin.js
```

---

## 📝 Notes

- All test accounts are pre-verified and active
- Passwords are case-sensitive
- Email addresses are unique identifiers
- Role changes require appropriate permissions
- All timestamps are in UTC

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Environment:** Development
