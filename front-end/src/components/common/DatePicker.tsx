import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "../ui/utils";

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: boolean;
  id?: string;
  name?: string;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
}

export const DatePicker = ({
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Select date",
  className,
  error = false,
  id,
  name,
  minDate,
  maxDate,
  showTime = false,
}: DatePickerProps) => {
  // Convert value to Date object
  // Handle date strings as local dates to avoid timezone issues
  const dateValue = useMemo(() => {
    if (!value) return undefined;
    
    if (typeof value === "string") {
      // If it's a date string in YYYY-MM-DD format, parse it as local date
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      // Otherwise, try parsing as Date
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    
    return value;
  }, [value]);

  // Check if date is valid
  const isValidDate = dateValue && !isNaN(dateValue.getTime());

  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    isValidDate ? startOfMonth(dateValue) : new Date()
  );

  // Update current month when date value changes externally
  useEffect(() => {
    if (isValidDate) {
      const newMonth = startOfMonth(dateValue);
      if (newMonth.getTime() !== currentMonth.getTime()) {
        setCurrentMonth(newMonth);
      }
    }
  }, [dateValue, isValidDate, currentMonth]);

  // Generate years list (100 years back from current year, forward based on maxDate)
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const yearList = [];
    const startYear = minDate ? minDate.getFullYear() : currentYear - 100;
    const endYear = maxDate ? maxDate.getFullYear() : currentYear + 50;
    for (let year = startYear; year <= endYear; year++) {
      yearList.push(year);
    }
    return yearList;
  }, [minDate, maxDate, currentYear]);

  // Months list
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(parseInt(monthIndex));
    setCurrentMonth(startOfMonth(newDate));
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    setCurrentMonth(startOfMonth(newDate));
  };

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const formatDisplayDate = (date: Date | undefined): string => {
    if (!date || isNaN(date.getTime())) {
      return "";
    }
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            id={id}
            name={name}
            className={cn(
              "w-full h-9 justify-start text-left font-normal bg-[var(--input-background)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)]",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              !isValidDate && "text-muted-foreground",
              isValidDate && "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)]"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">
              {isValidDate ? (
                formatDisplayDate(dateValue)
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="!w-[350px] !min-w-[350px] !max-w-[350px] p-0 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]"
          align="start"
          onBlur={onBlur}
          style={{ width: '350px', minWidth: '350px', maxWidth: '350px' }}
        >
          {/* Month and Year Selectors */}
          <div className="flex gap-2 p-4 border-b border-[var(--glass-border)]">
            <Select
              value={currentMonth.getMonth().toString()}
              onValueChange={handleMonthChange}
              disabled={disabled}
            >
              <SelectTrigger className="flex-1 h-9 bg-[var(--input-background)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)]">
                <SelectValue>
                  {months[currentMonth.getMonth()]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentMonth.getFullYear().toString()}
              onValueChange={handleYearChange}
              disabled={disabled}
            >
              <SelectTrigger className="flex-1 h-9 bg-[var(--input-background)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)]">
                <SelectValue>
                  {currentMonth.getFullYear()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent 
                className="max-h-[300px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--accent-border)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[var(--accent-primary)]"
                style={{ 
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--accent-border) transparent'
                }}
              >
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Calendar
            mode="single"
            selected={isValidDate ? dateValue : undefined}
            onSelect={handleSelect}
            disabled={disabled}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            initialFocus
            {...(minDate && { fromDate: minDate })}
            {...(maxDate && { toDate: maxDate })}
            className="rounded-md"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

