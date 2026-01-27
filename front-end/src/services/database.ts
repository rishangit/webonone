// Browser-compatible database service using localStorage
// This replaces node-json-db which doesn't work in browser environments

// Helper function to generate IDs
const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Storage helper with error handling
const storage = {
  get: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  }
};

// Initialize mock data
const initializeData = () => {
  // Initialize users if not exists - using simplified data for now
  if (!storage.get('db_users')) {
    storage.set('db_users', {
      users: [
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
          bio: "System administrator with full platform access and management capabilities.",
          permissions: ["*"],
          isActive: true,
          isVerified: true,
          createdAt: "2024-01-01T00:00:00Z",
          lastLogin: "2024-12-10T08:30:00Z",
          preferences: { theme: "dark", notifications: true, language: "en" }
        },
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
          bio: "Experienced beauty salon owner with over 10 years in the industry.",
          specializations: ["Business Management", "Customer Relations", "Beauty Services"],
          permissions: ["manage_company", "manage_staff", "view_analytics", "manage_appointments"],
          isActive: true,
          isVerified: true,
          createdAt: "2024-02-01T09:00:00Z",
          lastLogin: "2024-12-10T07:45:00Z",
          joinDate: "2024-02-01"
        },
        {
          id: "user_3",
          email: "alex.johnson@beautyspace.com",
          name: "Alex Johnson",
          firstName: "Alex",
          lastName: "Johnson",
          role: "Staff Member",
          roleLevel: 2,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          companyId: "comp_1",
          phone: "+1 (555) 234-5678",
          bio: "Senior hair stylist specializing in color treatments and modern cuts.",
          specializations: ["Hair Styling", "Color Treatments", "Hair Extensions"],
          permissions: ["manage_appointments", "view_client_info", "process_payments"],
          isActive: true,
          isVerified: true,
          createdAt: "2024-03-01T10:00:00Z",
          lastLogin: "2024-12-10T08:15:00Z",
          joinDate: "2024-03-01",
          appointmentsCount: 245
        },
        {
          id: "user_4",
          email: "emma.wilson@example.com",
          name: "Emma Wilson",
          firstName: "Emma",
          lastName: "Wilson",
          role: "User",
          roleLevel: 3,
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
          companyId: null,
          phone: "+1 (555) 456-7890",
          bio: "Regular client who loves beauty treatments and spa services.",
          permissions: ["book_appointments", "view_history", "manage_profile"],
          isActive: true,
          isVerified: true,
          createdAt: "2024-03-01T10:30:00Z",
          lastLogin: "2024-12-09T19:45:00Z",
          appointmentsCount: 23,
          totalSpent: 1250.00
        }
      ],
      userStats: {
        totalUsers: 4,
        activeUsers: 4,
        newUsersThisMonth: 2,
        userGrowthRate: 15.5,
        usersByRole: { superAdmin: 1, companyOwner: 1, staffMember: 1, user: 1 }
      }
    });
  }

  // Initialize companies if not exists
  if (!storage.get('db_companies')) {
    storage.set('db_companies', {
      companies: [
        {
          id: "comp_1",
          name: "Beauty Space Salon",
          description: "Premium beauty and wellness salon offering comprehensive spa services",
          email: "contact@beautyspace.com",
          phone: "+1 (555) 123-4567",
          website: "https://beautyspace.com",
          address: {
            street: "123 Beauty Avenue",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90210",
            country: "United States"
          },
          category: "Beauty & Wellness",
          subcategory: "Hair & Beauty Salons",
          logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
          status: "Approved",
          registrationDate: "2024-02-01",
          isActive: true,
          owner: "user_2",
          staff: ["user_3"],
          services: [],
          spaces: []
        }
      ],
      companyStats: {
        totalCompanies: 1,
        activeCompanies: 1,
        pendingCompanies: 0,
        newCompaniesThisMonth: 1,
        companyGrowthRate: 12.5
      }
    });
  }

  // Initialize products if not exists
  if (!storage.get('db_products')) {
    storage.set('db_products', {
      systemProducts: [
        {
          id: "sys-prod-1",
          name: "Premium Hair Shampoo",
          description: "Professional grade shampoo for all hair types. Sulfate-free formula with natural ingredients. Available in multiple variants.",
          sku: "BEA-SHP001",
          category: "Beauty & Wellness",
          subcategory: "Hair & Beauty Salons",
          imageUrl: "https://images.unsplash.com/photo-1556228724-4b9e5c0d3e02?w=400",
          isActive: true,
          usageCount: 45,
          createdDate: "2024-01-15",
          lastModified: "2024-09-20",
          tags: ["hair", "shampoo", "premium", "sulfate-free"],
          notes: "Popular item with high demand across multiple salon chains",
          variants: [
            {
              id: "var-1-1",
              name: "Premium Hair Shampoo - Dry Hair",
              description: "Specially formulated for dry and damaged hair with extra moisturizing agents",
              sku: "BEA-SHP001-DRY",
              isActive: true,
              color: "Golden",
              size: "500ml",
              weight: "520g",
              material: "Argan oil enriched",
              notes: "Best seller for dry hair treatment"
            },
            {
              id: "var-1-2",
              name: "Premium Hair Shampoo - Oily Hair",
              description: "Deep cleansing formula for oily hair with clarifying ingredients",
              sku: "BEA-SHP001-OIL",
              isActive: true,
              color: "Clear Blue",
              size: "500ml",
              weight: "510g",
              material: "Tea tree oil infused",
              notes: "Excellent for deep cleansing"
            }
          ]
        }
      ],
      companyProducts: [
        {
          id: "1",
          name: "Disposable Medical Gloves",
          description: "High-quality nitrile examination gloves for medical procedures",
          sku: "MED-GLV-001",
          category: "Medical Supplies",
          type: "service",
          price: { cost: 0.15 },
          stock: { current: 5000, minimum: 1000, unit: "pieces" },
          supplier: {
            name: "MedSupply Co.",
            contact: "supplier@medsupply.com",
            avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
          },
          status: "Active",
          popularity: "High",
          usage: { thisMonth: 1200, trend: "up" },
          addedBy: "system",
          image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=300&h=200&fit=crop",
          tags: ["Medical", "Disposable", "PPE"],
          lastRestocked: "2024-09-20",
          isAvailableForPurchase: false,
          usedInServices: ["checkup", "dental-cleaning"]
        },
        {
          id: "2",
          name: "Premium Dental Cleaning Kit",
          description: "Complete dental hygiene kit with ultrasonic cleaner and accessories",
          sku: "DNT-CLN-002",
          category: "Dental Equipment",
          type: "both",
          price: { cost: 450, sell: 120 },
          stock: { current: 25, minimum: 5, unit: "kits" },
          supplier: {
            name: "DentalTech Solutions",
            contact: "orders@dentaltech.com",
            avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop"
          },
          status: "Active",
          popularity: "High",
          usage: { thisMonth: 45, trend: "stable" },
          addedBy: "system",
          image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=300&h=200&fit=crop",
          tags: ["Dental", "Equipment", "Professional"],
          lastRestocked: "2024-09-15",
          isAvailableForPurchase: true,
          usedInServices: ["dental-cleaning", "dental-checkup"]
        },
        {
          id: "3",
          name: "Physical Therapy Resistance Bands",
          description: "Set of professional resistance bands for physical therapy and rehabilitation",
          sku: "PT-RES-003",
          category: "Therapy Equipment",
          type: "both",
          price: { cost: 25, sell: 65 },
          stock: { current: 8, minimum: 20, unit: "sets" },
          supplier: {
            name: "TherapyPro Equipment",
            contact: "support@therapypro.com",
            avatar: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=100&h=100&fit=crop"
          },
          status: "Low Stock",
          popularity: "Medium",
          usage: { thisMonth: 15, trend: "down" },
          addedBy: "system",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
          tags: ["Therapy", "Equipment", "Rehabilitation"],
          lastRestocked: "2024-08-30",
          isAvailableForPurchase: true,
          usedInServices: ["physiotherapy", "rehabilitation"],
          variants: [
            {
              id: "var-3-1",
              name: "Light Resistance Band",
              description: "Light resistance for beginners and gentle rehabilitation",
              sku: "PT-RES-003-LGT",
              isActive: true,
              color: "Yellow",
              size: "1.5m",
              weight: "150g",
              material: "Natural latex"
            },
            {
              id: "var-3-2",
              name: "Medium Resistance Band",
              description: "Medium resistance for intermediate therapy sessions",
              sku: "PT-RES-003-MED",
              isActive: true,
              color: "Green",
              size: "1.5m",
              weight: "200g",
              material: "Natural latex"
            },
            {
              id: "var-3-3",
              name: "Heavy Resistance Band",
              description: "High resistance for advanced strength training",
              sku: "PT-RES-003-HVY",
              isActive: true,
              color: "Red",
              size: "1.5m",
              weight: "250g",
              material: "Natural latex"
            }
          ]
        },
        {
          id: "4",
          name: "Premium Massage Oil Set",
          description: "Collection of therapeutic massage oils for spa treatments",
          sku: "SPA-OIL-005",
          category: "Spa Products",
          type: "both",
          price: { cost: 35, sell: 89 },
          stock: { current: 15, minimum: 10, unit: "sets" },
          supplier: {
            name: "Wellness Essentials",
            contact: "sales@wellnessessentials.com",
            avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
          },
          status: "Active",
          popularity: "Medium",
          usage: { thisMonth: 22, trend: "up" },
          addedBy: "company",
          companyId: "comp_1",
          image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300&h=200&fit=crop",
          tags: ["Spa", "Massage", "Therapeutic"],
          lastRestocked: "2024-09-10",
          isAvailableForPurchase: true,
          usedInServices: ["massage-therapy", "aromatherapy"],
          variants: [
            {
              id: "var-4-1",
              name: "Lavender Massage Oil",
              description: "Relaxing lavender scented massage oil",
              sku: "SPA-OIL-005-LAV",
              isActive: true,
              color: "Purple",
              size: "250ml",
              weight: "260g",
              material: "Essential oil blend"
            },
            {
              id: "var-4-2",
              name: "Eucalyptus Massage Oil",
              description: "Invigorating eucalyptus massage oil for muscle relief",
              sku: "SPA-OIL-005-EUC",
              isActive: true,
              color: "Clear",
              size: "250ml",
              weight: "265g",
              material: "Essential oil blend"
            }
          ]
        }
      ]
    });
  }

  // Initialize staff if not exists
  if (!storage.get('db_staff')) {
    storage.set('db_staff', {
      staff: [
        {
          id: "staff_1",
          firstName: "Alex",
          lastName: "Johnson",
          email: "alex.johnson@beautyspace.com",
          phone: "+1 (555) 234-5678",
          role: "Manager",
          department: "Treatment",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          status: "Active",
          joinDate: "2024-03-01",
          lastActive: "2 hours ago",
          permissions: [
            "View Dashboard",
            "Manage Appointments",
            "View Client Information",
            "Process Payments",
            "Manage Inventory",
            "View Reports",
            "Manage Services"
          ],
          companyId: "comp_1",
          address: "456 Salon Street, Los Angeles, CA 90210",
          bio: "Experienced hair stylist and salon manager with over 8 years in the beauty industry. Specializes in color treatments and advanced cutting techniques.",
          skills: ["Hair Styling", "Color Treatments", "Team Management", "Customer Service"],
          emergencyContact: {
            name: "Sarah Johnson",
            phone: "+1 (555) 876-5432",
            relationship: "spouse"
          }
        },
        {
          id: "staff_2",
          firstName: "Maria",
          lastName: "Rodriguez",
          email: "maria.rodriguez@beautyspace.com",
          phone: "+1 (555) 345-6789",
          role: "Senior Staff",
          department: "Treatment",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
          status: "Active",
          joinDate: "2024-04-15",
          lastActive: "1 hour ago",
          permissions: [
            "View Dashboard",
            "Manage Appointments",
            "View Client Information",
            "Process Payments",
            "Manage Services"
          ],
          companyId: "comp_1",
          address: "789 Beauty Ave, Los Angeles, CA 90210",
          bio: "Expert nail technician and beauty specialist with a passion for nail art and spa treatments.",
          skills: ["Nail Art", "Manicure", "Pedicure", "Spa Treatments"],
          emergencyContact: {
            name: "Carlos Rodriguez",
            phone: "+1 (555) 987-1234",
            relationship: "parent"
          }
        },
        {
          id: "staff_3",
          firstName: "David",
          lastName: "Chen",
          email: "david.chen@beautyspace.com",
          phone: "+1 (555) 456-7890",
          role: "Staff",
          department: "Reception",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          status: "Active",
          joinDate: "2024-05-20",
          lastActive: "30 minutes ago",
          permissions: [
            "View Dashboard",
            "Manage Appointments",
            "View Client Information",
            "Process Payments"
          ],
          companyId: "comp_1",
          address: "321 Reception Blvd, Los Angeles, CA 90210",
          bio: "Friendly receptionist and customer service specialist dedicated to providing excellent client experiences.",
          skills: ["Customer Service", "Appointment Scheduling", "Point of Sale", "Communication"],
          emergencyContact: {
            name: "Lisa Chen",
            phone: "+1 (555) 654-3210",
            relationship: "sibling"
          }
        }
      ]
    });
  }

  // Initialize categories if not exists
  if (!storage.get('db_categories')) {
    storage.set('db_categories', {
      categories: [
        {
          id: "cat-1",
          name: "Healthcare & Medical",
          description: "Medical practices, hospitals, clinics, and healthcare services",
          icon: "🏥",
          isActive: true,
          companyCount: 45,
          createdDate: "2024-01-15",
          lastModified: "2024-09-20",
          subcategories: [
            {
              id: "sub-1-1",
              name: "General Practice",
              description: "Family medicine and general healthcare",
              isActive: true,
              companyCount: 15,
              createdDate: "2024-01-15",
              lastModified: "2024-09-15"
            },
            {
              id: "sub-1-2", 
              name: "Dental Services",
              description: "Dental clinics and orthodontic services",
              isActive: true,
              companyCount: 12,
              createdDate: "2024-01-15",
              lastModified: "2024-09-10"
            }
          ]
        },
        {
          id: "cat-2",
          name: "Beauty & Wellness",
          description: "Salons, spas, fitness centers, and wellness services",
          icon: "💅",
          isActive: true,
          companyCount: 32,
          createdDate: "2024-01-15",
          lastModified: "2024-09-19",
          subcategories: [
            {
              id: "sub-2-1",
              name: "Hair & Beauty Salons",
              description: "Hair styling, coloring, and beauty treatments",
              isActive: true,
              companyCount: 20,
              createdDate: "2024-01-15",
              lastModified: "2024-09-12"
            },
            {
              id: "sub-2-2",
              name: "Spa & Massage",
              description: "Relaxation and therapeutic massage services",
              isActive: true,
              companyCount: 8,
              createdDate: "2024-01-15",
              lastModified: "2024-09-14"
            }
          ]
        }
      ]
    });
  }
};

// Initialize data on service load
initializeData();

// User Management
export const userService = {
  getAll: async () => {
    try {
      const data = storage.get('db_users', { users: [] });
      return data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const data = storage.get('db_users', { users: [] });
      return data.users.find((user: any) => user.id === id);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  getByEmail: async (email: string) => {
    try {
      const data = storage.get('db_users', { users: [] });
      return data.users.find((user: any) => user.email === email);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  },

  create: async (userData: any) => {
    try {
      const data = storage.get('db_users', { users: [] });
      const newUser = {
        id: generateId('user'),
        ...userData,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      data.users.push(newUser);
      storage.set('db_users', data);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  update: async (id: string, userData: any) => {
    try {
      const data = storage.get('db_users', { users: [] });
      const index = data.users.findIndex((user: any) => user.id === id);
      if (index !== -1) {
        data.users[index] = { ...data.users[index], ...userData, updatedAt: new Date().toISOString() };
        storage.set('db_users', data);
        return data.users[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const data = storage.get('db_users', { users: [] });
      data.users = data.users.filter((user: any) => user.id !== id);
      storage.set('db_users', data);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  getStats: async () => {
    try {
      const data = storage.get('db_users', { userStats: {} });
      return data.userStats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }
};

// Company Management
export const companyService = {
  getAll: async () => {
    try {
      const data = storage.get('db_companies', { companies: [] });
      return data.companies;
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const data = storage.get('db_companies', { companies: [] });
      return data.companies.find((company: any) => company.id === id);
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  },

  getByStatus: async (status: string) => {
    try {
      const data = storage.get('db_companies', { companies: [] });
      return data.companies.filter((company: any) => company.status === status);
    } catch (error) {
      console.error('Error fetching companies by status:', error);
      return [];
    }
  },

  create: async (companyData: any) => {
    try {
      const data = storage.get('db_companies', { companies: [] });
      const newCompany = {
        id: generateId('comp'),
        ...companyData,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        isActive: false,
        staff: [],
        services: [],
        spaces: []
      };
      data.companies.push(newCompany);
      storage.set('db_companies', data);
      return newCompany;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  update: async (id: string, companyData: any) => {
    try {
      const data = storage.get('db_companies', { companies: [] });
      const index = data.companies.findIndex((company: any) => company.id === id);
      if (index !== -1) {
        data.companies[index] = { ...data.companies[index], ...companyData };
        storage.set('db_companies', data);
        return data.companies[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  approve: async (id: string) => {
    try {
      const data = storage.get('db_companies', { companies: [] });
      const index = data.companies.findIndex((company: any) => company.id === id);
      if (index !== -1) {
        data.companies[index].status = 'Approved';
        data.companies[index].isActive = true;
        storage.set('db_companies', data);
        return data.companies[index];
      }
      return null;
    } catch (error) {
      console.error('Error approving company:', error);
      throw error;
    }
  },

  reject: async (id: string) => {
    try {
      const data = storage.get('db_companies', { companies: [] });
      const index = data.companies.findIndex((company: any) => company.id === id);
      if (index !== -1) {
        data.companies[index].status = 'Rejected';
        data.companies[index].isActive = false;
        storage.set('db_companies', data);
        return data.companies[index];
      }
      return null;
    } catch (error) {
      console.error('Error rejecting company:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const data = storage.get('db_companies', { companyStats: {} });
      return data.companyStats;
    } catch (error) {
      console.error('Error fetching company stats:', error);
      return null;
    }
  }
};

// Category Management
export const categoryService = {
  getAll: async () => {
    try {
      const data = storage.get('db_categories', { categories: [] });
      return data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const data = storage.get('db_categories', { categories: [] });
      return data.categories.find((category: any) => category.id === id);
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  },

  getActive: async () => {
    try {
      const data = storage.get('db_categories', { categories: [] });
      return data.categories.filter((category: any) => category.isActive);
    } catch (error) {
      console.error('Error fetching active categories:', error);
      return [];
    }
  },

  create: async (categoryData: any) => {
    try {
      const data = storage.get('db_categories', { categories: [] });
      const newCategory = {
        id: generateId('cat'),
        ...categoryData,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        companyCount: 0,
        subcategories: []
      };
      data.categories.push(newCategory);
      storage.set('db_categories', data);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  update: async (id: string, categoryData: any) => {
    try {
      const data = storage.get('db_categories', { categories: [] });
      const index = data.categories.findIndex((category: any) => category.id === id);
      if (index !== -1) {
        data.categories[index] = { 
          ...data.categories[index], 
          ...categoryData, 
          lastModified: new Date().toISOString().split('T')[0] 
        };
        storage.set('db_categories', data);
        return data.categories[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const data = storage.get('db_categories', { categories: [] });
      data.categories = data.categories.filter((category: any) => category.id !== id);
      storage.set('db_categories', data);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }
};

// Product Management
export const productService = {
  getSystemProducts: async () => {
    try {
      const data = storage.get('db_products', { systemProducts: [] });
      return data.systemProducts;
    } catch (error) {
      console.error('Error fetching system products:', error);
      return [];
    }
  },

  getCompanyProducts: async (companyId?: string) => {
    try {
      const data = storage.get('db_products', { companyProducts: [] });
      if (companyId) {
        return data.companyProducts.filter((product: any) => product.companyId === companyId);
      }
      return data.companyProducts;
    } catch (error) {
      console.error('Error fetching company products:', error);
      return [];
    }
  },

  getSystemProductById: async (id: string) => {
    try {
      const data = storage.get('db_products', { systemProducts: [] });
      return data.systemProducts.find((product: any) => product.id === id);
    } catch (error) {
      console.error('Error fetching system product:', error);
      return null;
    }
  },

  getCompanyProductById: async (id: string) => {
    try {
      const data = storage.get('db_products', { companyProducts: [] });
      return data.companyProducts.find((product: any) => product.id === id);
    } catch (error) {
      console.error('Error fetching company product:', error);
      return null;
    }
  },

  createSystemProduct: async (productData: any) => {
    try {
      const data = storage.get('db_products', { systemProducts: [] });
      const newProduct = {
        id: generateId('sys_prod'),
        ...productData,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        usageCount: 0,
        variants: productData.variants || []
      };
      data.systemProducts.push(newProduct);
      storage.set('db_products', data);
      return newProduct;
    } catch (error) {
      console.error('Error creating system product:', error);
      throw error;
    }
  },

  createCompanyProduct: async (productData: any) => {
    try {
      const data = storage.get('db_products', { companyProducts: [] });
      const newProduct = {
        id: generateId('comp_prod'),
        ...productData,
        lastRestocked: new Date().toISOString().split('T')[0],
        variants: productData.variants || []
      };
      data.companyProducts.push(newProduct);
      storage.set('db_products', data);
      return newProduct;
    } catch (error) {
      console.error('Error creating company product:', error);
      throw error;
    }
  },

  updateSystemProduct: async (id: string, productData: any) => {
    try {
      const data = storage.get('db_products', { systemProducts: [] });
      const index = data.systemProducts.findIndex((product: any) => product.id === id);
      if (index !== -1) {
        data.systemProducts[index] = { 
          ...data.systemProducts[index], 
          ...productData, 
          lastModified: new Date().toISOString().split('T')[0] 
        };
        storage.set('db_products', data);
        return data.systemProducts[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating system product:', error);
      throw error;
    }
  },

  updateCompanyProduct: async (id: string, productData: any) => {
    try {
      const data = storage.get('db_products', { companyProducts: [] });
      const index = data.companyProducts.findIndex((product: any) => product.id === id);
      if (index !== -1) {
        data.companyProducts[index] = { ...data.companyProducts[index], ...productData };
        storage.set('db_products', data);
        return data.companyProducts[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating company product:', error);
      throw error;
    }
  },

  addVariant: async (productId: string, variantData: any, isSystemProduct: boolean = true) => {
    try {
      const data = storage.get('db_products', { systemProducts: [], companyProducts: [] });
      const products = isSystemProduct ? data.systemProducts : data.companyProducts;
      const index = products.findIndex((product: any) => product.id === productId);
      
      if (index !== -1) {
        const newVariant = {
          id: generateId('var'),
          ...variantData,
          isActive: true
        };
        
        if (!products[index].variants) {
          products[index].variants = [];
        }
        products[index].variants.push(newVariant);
        
        storage.set('db_products', data);
        return newVariant;
      }
      return null;
    } catch (error) {
      console.error('Error adding variant:', error);
      throw error;
    }
  },

  removeVariant: async (productId: string, variantId: string, isSystemProduct: boolean = true) => {
    try {
      const data = storage.get('db_products', { systemProducts: [], companyProducts: [] });
      const products = isSystemProduct ? data.systemProducts : data.companyProducts;
      const index = products.findIndex((product: any) => product.id === productId);
      
      if (index !== -1 && products[index].variants) {
        products[index].variants = products[index].variants.filter(
          (variant: any) => variant.id !== variantId
        );
        storage.set('db_products', data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing variant:', error);
      throw error;
    }
  },

  updateVariant: async (productId: string, variantId: string, variantData: any, isSystemProduct: boolean = true) => {
    try {
      const data = storage.get('db_products', { systemProducts: [], companyProducts: [] });
      const products = isSystemProduct ? data.systemProducts : data.companyProducts;
      const productIndex = products.findIndex((product: any) => product.id === productId);
      
      if (productIndex !== -1 && products[productIndex].variants) {
        const variantIndex = products[productIndex].variants.findIndex(
          (variant: any) => variant.id === variantId
        );
        
        if (variantIndex !== -1) {
          products[productIndex].variants[variantIndex] = {
            ...products[productIndex].variants[variantIndex],
            ...variantData
          };
          storage.set('db_products', data);
          return products[productIndex].variants[variantIndex];
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating variant:', error);
      throw error;
    }
  }
};

// Staff Management
export const staffService = {
  getAll: async (companyId?: string) => {
    try {
      const data = storage.get('db_staff', { staff: [] });
      if (companyId) {
        return data.staff.filter((member: any) => member.companyId === companyId);
      }
      return data.staff;
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const data = storage.get('db_staff', { staff: [] });
      return data.staff.find((member: any) => member.id === id);
    } catch (error) {
      console.error('Error fetching staff member:', error);
      return null;
    }
  },

  create: async (staffData: any) => {
    try {
      const data = storage.get('db_staff', { staff: [] });
      const newStaff = {
        id: generateId('staff'),
        ...staffData,
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
        status: 'Active'
      };
      data.staff.push(newStaff);
      storage.set('db_staff', data);
      return newStaff;
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  },

  update: async (id: string, staffData: any) => {
    try {
      const data = storage.get('db_staff', { staff: [] });
      const index = data.staff.findIndex((member: any) => member.id === id);
      if (index !== -1) {
        data.staff[index] = { ...data.staff[index], ...staffData };
        storage.set('db_staff', data);
        return data.staff[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const data = storage.get('db_staff', { staff: [] });
      data.staff = data.staff.filter((member: any) => member.id !== id);
      storage.set('db_staff', data);
      return true;
    } catch (error) {
      console.error('Error deleting staff member:', error);
      return false;
    }
  }
};

// Export all services
export const database = {
  users: userService,
  companies: companyService,
  categories: categoryService,
  products: productService,
  staff: staffService
};

export default database;