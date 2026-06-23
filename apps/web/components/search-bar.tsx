"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
    </div>
  );
}
