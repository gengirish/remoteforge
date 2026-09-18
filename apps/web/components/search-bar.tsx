"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  defaultValue?: string;
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  className,
  defaultValue = "",
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  // Debounce on typing only. Keying the effect on onSearch re-armed it on every
  // parent render, and the late call replayed stale filters over newer clicks.
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  const lastSearched = useRef(defaultValue);

  useEffect(() => {
    if (value === lastSearched.current) return;
    const timer = setTimeout(() => {
      lastSearched.current = value;
      onSearchRef.current(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10"
        aria-label={placeholder}
      />
    </div>
  );
}
