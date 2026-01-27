import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "./utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";

export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MultiSelectProps {
  options: Option[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  value?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      defaultValue = [],
      value,
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const [internalSelectedValues, setInternalSelectedValues] = React.useState<string[]>(() => defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Use controlled or uncontrolled pattern
    const selectedValues = value !== undefined ? value : internalSelectedValues;

    // Define updateValues first since other callbacks depend on it
    const updateValues = React.useCallback((newValues: string[]) => {
      if (value === undefined) {
        // Uncontrolled mode
        setInternalSelectedValues(newValues);
      }
      onValueChange(newValues);
    }, [value, onValueChange]);

    const handleInputKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value && selectedValues.length > 0) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        updateValues(newSelectedValues);
      }
    }, [selectedValues, updateValues]);

    const toggleOption = React.useCallback((option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      updateValues(newSelectedValues);
    }, [selectedValues, updateValues]);

    const handleClear = React.useCallback(() => {
      updateValues([]);
    }, [updateValues]);

    const handleTogglePopover = React.useCallback(() => {
      setIsPopoverOpen((prev) => !prev);
    }, []);

    const clearExtraOptions = React.useCallback(() => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      updateValues(newSelectedValues);
    }, [selectedValues, maxCount, updateValues]);

    const toggleAll = React.useCallback(() => {
      if (selectedValues.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        updateValues(allValues);
      }
    }, [selectedValues.length, options, handleClear, updateValues]);



    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] transition-all duration-200",
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex items-center justify-between w-full mx-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)] hover:bg-[var(--accent-bg)]">
                    {selectedValues.length} Selected
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <X
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                  <ChevronDown className={cn(
                    "h-4 w-4 cursor-pointer text-muted-foreground transition-transform duration-200",
                    isPopoverOpen && "rotate-180"
                  )} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-3">
                <span className="text-sm text-muted-foreground">{placeholder}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 cursor-pointer text-muted-foreground transition-transform duration-200",
                  isPopoverOpen && "rotate-180"
                )} />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-popover border-border backdrop-blur-sm"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput
              placeholder="Search..."
              onKeyDown={handleInputKeyDown}
              className="bg-[var(--input-background)] border-none text-foreground placeholder:text-muted-foreground focus:bg-[var(--input-background)] transition-colors"
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  className="cursor-pointer text-foreground hover:bg-[var(--accent-bg)] transition-colors"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border transition-all",
                      selectedValues.length === options.length
                        ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-button-text)]"
                        : "border-[var(--accent-border)] hover:border-[var(--accent-primary)] [&_svg]:invisible"
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </div>
                  <span>(Select All {options.length})</span>
                </CommandItem>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="cursor-pointer text-foreground hover:bg-[var(--accent-bg)] transition-colors"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border transition-all",
                          isSelected
                            ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-button-text)]"
                            : "border-[var(--accent-border)] hover:border-[var(--accent-primary)] [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";