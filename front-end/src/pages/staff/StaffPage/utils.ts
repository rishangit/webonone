import { Staff } from "@/services/staff";

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Active": 
      return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
    case "Inactive": 
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    case "Pending": 
      return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
    default: 
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case "Manager": 
      return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
    case "Senior Staff": 
      return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "Staff": 
      return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
    case "Intern": 
      return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
    default: 
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
  }
};
