import { useMemo } from "react";
import { formatDate } from "../../utils";

interface DateDisplayProps {
  date: string | Date | null | undefined;
  className?: string;
  fallback?: string;
}

/**
 * Common component to display formatted date
 * Format: "Jan 9, 2026" (e.g., "Jan 9, 2026")
 * 
 * @example
 * <DateDisplay date="2026-01-09" />
 * <DateDisplay date={new Date()} className="text-sm" />
 * <DateDisplay date={null} fallback="Not set" />
 */
export const DateDisplay = ({ 
  date, 
  className = "", 
  fallback = "—" 
}: DateDisplayProps) => {
  const formattedDate = useMemo(() => {
    if (!date) return fallback;

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return fallback;
      }

      // Format: "Jan 9, 2026"
      return formatDate(dateObj);
    } catch (error) {
      console.error("Error formatting date:", error);
      return fallback;
    }
  }, [date, fallback]);

  return <span className={className}>{formattedDate}</span>;
};

