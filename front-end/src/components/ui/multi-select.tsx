import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "./utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "./command";
import { SearchInput } from "../common/SearchInput";
import { selectTriggerClasses, selectIconClasses } from "./select";

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
    const [searchTerm, setSearchTerm] = React.useState("");
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>(undefined);

    // Merge refs
    const setRefs = React.useCallback((node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && 'current' in ref) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ref as any).current = node;
      }
    }, [ref]);

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

    // Measure trigger width when popover opens
    React.useEffect(() => {
      if (isPopoverOpen && triggerRef.current) {
        setPopoverWidth(triggerRef.current.offsetWidth);
      }
    }, [isPopoverOpen]);

    // Reset search when popover closes
    React.useEffect(() => {
      if (!isPopoverOpen) {
        setSearchTerm("");
      }
    }, [isPopoverOpen]);

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
            ref={setRefs}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              selectTriggerClasses,
              "bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] font-normal",
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <>
                <div className="flex items-center gap-2 flex-1 min-w-0" data-slot="select-value" style={{ pointerEvents: 'none' }}>
                  <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)] hover:bg-[var(--accent-bg)] text-xs whitespace-nowrap">
                    {selectedValues.length} Selected
                  </Badge>
                  <X
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground pointer-events-auto shrink-0"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>
                <ChevronDown className={cn(
                  selectIconClasses,
                  isPopoverOpen && "rotate-180"
                )} aria-hidden="true" />
              </>
            ) : (
              <>
                <span 
                  data-slot="select-value"
                  data-placeholder
                  style={{ pointerEvents: 'none' }}
                >
                  {placeholder}
                </span>
                <ChevronDown className={cn(
                  selectIconClasses,
                  isPopoverOpen && "rotate-180"
                )} aria-hidden="true" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 bg-popover border-border backdrop-blur-sm"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
          style={{ 
            width: popoverWidth ? `${popoverWidth}px` : undefined,
            minWidth: popoverWidth ? `${popoverWidth}px` : undefined
          }}
        >
          <div className="p-2 border-b border-border">
            <SearchInput
              placeholder="Search..."
              value={searchTerm}
              onChange={setSearchTerm}
              debounceDelay={0}
              className="w-full"
            />
          </div>
          <Command>
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
                {options
                  .filter((option) => {
                    if (!searchTerm) return true;
                    return option.label.toLowerCase().includes(searchTerm.toLowerCase());
                  })
                  .map((option) => {
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