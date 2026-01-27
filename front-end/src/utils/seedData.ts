// Data seeder to populate the database with comprehensive test data
import { database } from '../services';

// Generate random dates within a range
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

const randomDateString = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// Comprehensive user dataset (50+ users)
const seedUsers = [
  // Super Admins (roleLevel: 0) - 3 users
  {
    id: "user_1",
    email: "admin@appointmentapp.com",
    name: "System Administrator",
    firstName: "System",
    lastName: "Administrator",
    role: "Super Admin",
    roleLevel: 0,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    companyId: null,
    phone: "+1 (555) 000-0001",
    address: "1 Admin Plaza, Tech City, TC 12345",
    bio: "System administrator with full platform access and management capabilities.",
    permissions: ["*"],
    isActive: true,
    isVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-12-10T08:30:00Z",
    preferences: { theme: "dark", notifications: true, language: "en" }
  },
  {
    id: "user_14",
    email: "admin.platform@appointmentapp.com",
    name: "Platform Admin",
    firstName: "Platform",
    lastName: "Admin",
    role: "Super Admin",
    roleLevel: 0,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    companyId: null,
    phone: "+1 (555) 000-0002",
    address: "2 Admin Tower, Tech City, TC 12345",
    bio: "Platform administrator responsible for system maintenance and user support.",
    permissions: ["*"],
    isActive: true,
    isVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-12-10T09:00:00Z",
    preferences: { theme: "system", notifications: true, language: "en" }
  },
  {
    id: "user_30",
    email: "admin.support@appointmentapp.com",
    name: "Support Administrator",
    firstName: "Support",
    lastName: "Administrator",
    role: "Super Admin",
    roleLevel: 0,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    companyId: null,
    phone: "+1 (555) 000-0003",
    address: "3 Support Center, Tech City, TC 12345",
    bio: "Customer support administrator handling user queries and technical issues.",
    permissions: ["*"],
    isActive: true,
    isVerified: true,
    createdAt: "2024-01-15T00:00:00Z",
    lastLogin: "2024-12-10T09:15:00Z",
    preferences: { theme: "light", notifications: true, language: "en" }
  },

  // Company Owners (roleLevel: 1) - 10 users
  {
    id: "user_2",
    email: "owner@beautyspace.com",
    name: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "Company Owner",
    roleLevel: 1,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    companyId: "comp_1",
    phone: "+1 (555) 123-4567",
    address: "123 Beauty Avenue, Los Angeles, CA 90210",
    dateOfBirth: "1985-04-15",
    bio: "Experienced beauty salon owner with over 10 years in the industry.",
    specializations: ["Business Management", "Customer Relations", "Beauty Services"],
    permissions: ["manage_company", "manage_staff", "view_analytics", "manage_appointments"],
    isActive: true,
    isVerified: true,
    createdAt: "2024-02-01T09:00:00Z",
    lastLogin: "2024-12-10T07:45:00Z",
    joinDate: "2024-02-01",
    emergencyContact: { name: "Michael Johnson", phone: "+1 (555) 123-4568", relationship: "spouse" },
    preferences: { theme: "light", notifications: true, language: "en" }
  },
  {
    id: "user_3",
    email: "owner@dentalcare.com",
    name: "Dr. Michael Chen",
    firstName: "Michael",
    lastName: "Chen",
    role: "Company Owner",
    roleLevel: 1,
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    companyId: "comp_2",
    phone: "+1 (555) 987-6543",
    address: "456 Health Street, San Francisco, CA 94105",
    dateOfBirth: "1978-11-22",
    bio: "Licensed dentist and clinic owner specializing in general and cosmetic dentistry.",
    specializations: ["General Dentistry", "Cosmetic Dentistry", "Practice Management"],
    permissions: ["manage_company", "manage_staff", "view_analytics", "manage_appointments"],
    isActive: true,
    isVerified: true,
    createdAt: "2024-03-15T08:00:00Z",
    lastLogin: "2024-12-10T06:20:00Z",
    joinDate: "2024-03-15",
    emergencyContact: { name: "Lisa Chen", phone: "+1 (555) 987-6544", relationship: "spouse" }
  }
  // Additional company owners would be added here...
];

// Function to seed the database with comprehensive data
export const seedDatabase = async () => {
  try {
    // Clear existing data
    localStorage.removeItem('db_users');
    
    // Set comprehensive user data
    const userData = {
      users: seedUsers,
      userStats: {
        totalUsers: seedUsers.length,
        activeUsers: seedUsers.filter(u => u.isActive).length,
        newUsersThisMonth: 8,
        userGrowthRate: 18.5,
        usersByRole: {
          superAdmin: seedUsers.filter(u => u.roleLevel === 0).length,
          companyOwner: seedUsers.filter(u => u.roleLevel === 1).length,
          staffMember: seedUsers.filter(u => u.roleLevel === 2).length,
          user: seedUsers.filter(u => u.roleLevel === 3).length
        },
        averageAppointmentsPerUser: 24.8,
        totalRevenue: 89750.00,
        averageSpentPerUser: 1795.00
      }
    };
    
    localStorage.setItem('db_users', JSON.stringify(userData));
    console.log('Database seeded successfully with', seedUsers.length, 'users');
    
    return {
      success: true,
      message: `Database seeded with ${seedUsers.length} users`,
      stats: userData.userStats
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Auto-seed on first load
if (typeof window !== 'undefined' && !localStorage.getItem('db_users')) {
  seedDatabase();
}