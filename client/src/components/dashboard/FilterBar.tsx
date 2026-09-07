import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import type { ReactNode } from "react";
import { useState } from "react";

type FilterConfig =
  | { type: "search"; placeholder?: string; value: string; onChange: (value: string) => void }
  | { type: "select"; label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }
  | { type: "date"; label: string; value: Date | undefined; onChange: (value: Date | undefined) => void }
  | { type: "custom"; render: () => ReactNode };

interface FilterBarProps {
  filters: FilterConfig[];
  onReset?: () => void;
  className?: string;
}

export function FilterBar({ filters, onReset, className = "" }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = filters.some(f => {
    if (f.type === "search") return f.value.length > 0;
    if (f.type === "select") return f.value && f.value !== "all";
    if (f.type === "date") return f.value !== undefined;
    return false;
  });

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {filters.map((filter, index) => {
        if (filter.type === "search") {
          return (
            <div key={index} className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={filter.placeholder || "Search..."}
                value={filter.value}
                onChange={e => filter.onChange(e.target.value)}
                className="pl-9 h-9 bg-white dark:bg-[#16243d]"
              />
            </div>
          );
        }
        if (filter.type === "select") {
          return (
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="h-9 min-w-[140px] bg-white dark:bg-[#16243d]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label.toLowerCase()}</SelectItem>
                {filter.options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        if (filter.type === "date") {
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-9 min-w-[140px] justify-start text-left font-normal bg-white dark:bg-[#16243d] ${!filter.value && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filter.value ? format(filter.value, "PPP") : <span>{filter.label}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filter.value}
                  onSelect={filter.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          );
        }
        if (filter.type === "custom") {
          return <div key={index}>{filter.render()}</div>;
        }
        return null;
      })}
      {hasActiveFilters && onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
