import { useMemo } from "react";

interface DateTimeProps {
  date: string | Date | null | undefined;
  className?: string;
}

/**
 * Common component to display formatted date and time
 * Format: DD/MM/YYYY HH:MM AM/PM (e.g., "21/12/2025 01:30 PM")
 */
export const DateTime = ({ date, className = "" }: DateTimeProps) => {
  const formattedDateTime = useMemo(() => {
    if (!date) return "—";

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "—";
      }

      // Format: DD/MM/YYYY HH:MM AM/PM
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      
      let hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedHours = String(hours).padStart(2, "0");

      return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "—";
    }
  }, [date]);

  return <span className={className}>{formattedDateTime}</span>;
};

