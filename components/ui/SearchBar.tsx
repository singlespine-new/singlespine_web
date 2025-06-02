'use client'

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X, Loader2 } from "lucide-react"; // Import icons from Lucide

// @ts-expect-error <-- this type is to be skipped
interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  onSearch?: (query: string) => void;
  iconPosition?: "left" | "right";
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  clearButton?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({
    className,
    containerClassName,
    placeholder = "Search...",
    onSearch,
    iconPosition = "left",
    variant = "default",
    size = "md",
    clearButton = true,
    loading = false,
    onChange,
    icon,
    ...props
  }, ref) => {
    const [query, setQuery] = React.useState(props.value || props.defaultValue || "");
    const [focused, setFocused] = React.useState(false);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setQuery(newValue);
      onChange?.(e);
    };

    // Handle search submission
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(query as string);
    };

    // Handle clearing the search
    const handleClear = () => {
      setQuery("");
      onSearch?.("");
      // Simulate an input change event
      const event = {
        target: { value: "" }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
    };

    // Define container styles based on variant and size
    const containerStyles = cn(
      "relative flex items-center w-full rounded-full transition-all",
      {
        // Variant styles
        "bg-background border border-border/40 shadow-sm": variant === "default",
        "bg-transparent border border-foreground/20": variant === "outline",
        "bg-foreground/5": variant === "ghost",

        // Size styles
        "h-10": size === "sm",
        "h-12": size === "md",
        "h-14": size === "lg",

        // Focus styles
        "ring-2 ring-primary/20": focused,
      },
      containerClassName
    );

    // Determine icon size based on search bar size
    const iconSize = size === "sm" ? 16 : size === "md" ? 18 : 20;

    return (
      <form className={containerStyles} onSubmit={handleSubmit}>
        {/* Icon - Left Position */}
        {iconPosition === "left" && (
          <div className="absolute left-3 flex items-center justify-center text-foreground/50">
            {icon || <Search size={iconSize} />}
          </div>
        )}

        {/* Search Input */}
        <Input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className={cn(
            "h-full w-full bg-transparent border-none shadow-none rounded-full",
            {
              "pl-10 pr-4": iconPosition === "left" && !clearButton,
              "pl-10 pr-10": iconPosition === "left" && clearButton,
              "pl-4 pr-10": iconPosition === "right" && (clearButton || (!clearButton && !query)),
              "text-sm": size === "sm",
              "text-base": size === "md",
              "text-lg": size === "lg",
            },
            className
          )}
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-3 flex items-center justify-center">
            <Loader2 size={iconSize} className="animate-spin text-primary" />
          </div>
        )}

        {/* Clear Button */}
        {clearButton && query && !loading && (
          <button
            type="button"
            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-foreground/60 transition-colors hover:bg-foreground/20"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={iconSize - 4} />
          </button>
        )}

        {/* Icon - Right Position */}
        {iconPosition === "right" && !clearButton && !query && !loading && (
          <button
            type="submit"
            className="absolute right-3 flex items-center justify-center text-foreground/50"
            aria-label="Search"
          >
            {icon || <Search size={iconSize} />}
          </button>
        )}
      </form>
    );
  }
);

SearchBar.displayName = "SearchBar";

export { SearchBar };
