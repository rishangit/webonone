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
