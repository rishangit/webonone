import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { Icon } from "./Icon";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceDelay?: number;
  className?: string;
  showClearButton?: boolean;
  disabled?: boolean;
}

const SearchInputComponent = ({
  placeholder = "Search...",
  value: controlledValue,
  onChange,
  onDebouncedChange,
  debounceDelay = 500,
  className,
  showClearButton = true,
  disabled = false,
}: SearchInputProps) => {
  console.log('[SearchInput] Component render', {
    controlledValue,
    placeholder,
    debounceDelay,
    hasOnChange: !!onChange,
    hasOnDebouncedChange: !!onDebouncedChange,
    onChangeRef: onChange?.toString().substring(0, 50),
    onDebouncedChangeRef: onDebouncedChange?.toString().substring(0, 50),
  });

  const [internalValue, setInternalValue] = useState(controlledValue || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const wasFocusedRef = useRef(false);

  // Track focus state and cursor position before potential re-render
  const handleFocus = () => {
    const input = inputRef.current;
    if (input) {
      console.log('[SearchInput] handleFocus - setting focus flag');
      wasFocusedRef.current = true;
      cursorPositionRef.current = input.selectionStart;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Only clear focus tracking if focus moved to another element (not just a re-render)
    // Use relatedTarget to check if focus moved to another element
    const relatedTarget = e.relatedTarget as HTMLElement;
    console.log('[SearchInput] handleBlur', {
      relatedTarget: relatedTarget?.tagName,
      activeElement: document.activeElement?.tagName,
      wasFocused: wasFocusedRef.current,
    });
    if (!relatedTarget || !inputRef.current?.contains(relatedTarget)) {
      // Focus moved outside the input - clear the flag
      setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          console.log('[SearchInput] Clearing focus flag - focus moved outside');
          wasFocusedRef.current = false;
          cursorPositionRef.current = null;
        }
      }, 0);
    }
  };

  // Sync internal value with controlled value when it changes externally
  useEffect(() => {
    if (controlledValue !== undefined) {
      console.log('[SearchInput] controlledValue changed externally', {
        oldValue: internalValue,
        newValue: controlledValue,
        wasFocused: wasFocusedRef.current,
      });
      setInternalValue(controlledValue);
    }
  }, [controlledValue, internalValue]);

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Restore focus and cursor position after re-render (only if it was previously focused)
  useEffect(() => {
    console.log('[SearchInput] Focus restoration effect running', {
      wasFocused: wasFocusedRef.current,
      activeElement: document.activeElement?.tagName,
      inputExists: !!inputRef.current,
      cursorPosition: cursorPositionRef.current,
    });
    
    // Only restore focus if the input was focused before re-render
    if (wasFocusedRef.current && inputRef.current) {
      const input = inputRef.current;
      // Check if focus was lost during re-render
      if (document.activeElement !== input) {
        console.log('[SearchInput] Focus was lost, attempting to restore...');
        // Use requestAnimationFrame to ensure DOM is updated
        const rafId = requestAnimationFrame(() => {
          // Double-check after animation frame
          if (input && document.activeElement !== input && wasFocusedRef.current) {
            console.log('[SearchInput] Restoring focus and cursor position', {
              cursorPosition: cursorPositionRef.current,
              valueLength: input.value.length,
            });
            input.focus();
            // Restore cursor position
            if (cursorPositionRef.current !== null) {
              input.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
            } else {
              // If no cursor position saved, move to end
              const length = input.value.length;
              input.setSelectionRange(length, length);
            }
          } else {
            console.log('[SearchInput] Focus restoration skipped - conditions not met', {
              inputExists: !!input,
              activeElement: document.activeElement?.tagName,
              wasFocused: wasFocusedRef.current,
            });
          }
        });
        return () => cancelAnimationFrame(rafId);
      } else {
        console.log('[SearchInput] Focus still active, no restoration needed');
      }
    } else {
      console.log('[SearchInput] No focus restoration needed', {
        wasFocused: wasFocusedRef.current,
        inputExists: !!inputRef.current,
      });
    }
    // Don't reset the flag here - let it persist until blur actually happens
  }); // Run on every render to catch re-renders from parent state updates

  // Debounce the search value
  useEffect(() => {
    console.log('[SearchInput] Debounce effect triggered', {
      value,
      debounceDelay,
      hasOnDebouncedChange: !!onDebouncedChange,
    });
    const timer = setTimeout(() => {
      if (onDebouncedChange) {
        console.log('[SearchInput] Calling onDebouncedChange', { value });
        onDebouncedChange(value);
      }
    }, debounceDelay);

    return () => {
      console.log('[SearchInput] Clearing debounce timer');
      clearTimeout(timer);
    };
  }, [value, debounceDelay, onDebouncedChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    console.log('[SearchInput] handleChange', {
      newValue,
      cursorPosition: cursorPos,
      wasFocused: wasFocusedRef.current,
      isControlled: controlledValue !== undefined,
    });
    // Save cursor position
    cursorPositionRef.current = cursorPos;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    if (onChange) {
      console.log('[SearchInput] Calling onChange callback');
      onChange(newValue);
    }
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue("");
    }
    if (onChange) {
      onChange("");
    }
    if (onDebouncedChange) {
      onDebouncedChange("");
    }
    // Focus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className={cn("relative", className)}>
      <Icon icon={Search} size="sm" color="muted" className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          "pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground",
          "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[var(--glass-border)]",
          showClearButton && value && "pr-10"
        )}
      />
      {showClearButton && value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-transparent"
          disabled={disabled}
        >
          <Icon icon={X} size="sm" color="muted" className="hover:text-foreground" />
        </Button>
      )}
    </div>
  );
};

// Memoize with custom comparison to prevent re-renders when parent re-renders
// Only re-render if props actually change
export const SearchInput = React.memo(SearchInputComponent, (prevProps, nextProps) => {
  // Return true if props are equal (don't re-render), false if different (should re-render)
  const propsEqual = (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.debounceDelay === nextProps.debounceDelay &&
    prevProps.className === nextProps.className &&
    prevProps.showClearButton === nextProps.showClearButton &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.onDebouncedChange === nextProps.onDebouncedChange
  );
  
  console.log('[SearchInput] Memo comparison', {
    propsEqual,
    valueChanged: prevProps.value !== nextProps.value,
    onChangeChanged: prevProps.onChange !== nextProps.onChange,
    onDebouncedChangeChanged: prevProps.onDebouncedChange !== nextProps.onDebouncedChange,
    prevValue: prevProps.value,
    nextValue: nextProps.value,
    prevOnChangeRef: prevProps.onChange?.toString().substring(0, 50),
    nextOnChangeRef: nextProps.onChange?.toString().substring(0, 50),
    prevOnDebouncedChangeRef: prevProps.onDebouncedChange?.toString().substring(0, 50),
    nextOnDebouncedChangeRef: nextProps.onDebouncedChange?.toString().substring(0, 50),
  });
  
  return propsEqual;
});

SearchInput.displayName = "SearchInput";
