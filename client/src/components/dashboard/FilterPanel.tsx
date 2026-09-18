import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  activeCount: number;
  collapsible?: boolean;
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onClear,
  activeCount,
  collapsible = true,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = activeCount > 0;

  if (!collapsible) {
    return (
      <div className="rounded-xl border border-[#16243d]/10 bg-white p-5">
        <div className="flex flex-wrap items-end gap-4">
          {filters.map(filter => (
            <FilterField
              key={filter.key}
              filter={filter}
              value={values[filter.key] || ""}
              onChange={value => onChange(filter.key, value)}
            />
          ))}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-9 gap-1 text-[10px] font-black uppercase tracking-[.08em] text-red-700 hover:text-red-800"
            >
              <X size={13} /> Clear
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#16243d]/10 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
            Filters
          </span>
          {hasActiveFilters && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a34e] text-[9px] font-black text-white">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onClear();
              }}
              className="h-7 gap-1 text-[10px] font-black uppercase tracking-[.08em] text-red-700 hover:text-red-800"
            >
              <X size={12} /> Clear
            </Button>
          )}
          {isOpen ? (
            <ChevronUp size={16} className="text-[#657084]" />
          ) : (
            <ChevronDown size={16} className="text-[#657084]" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[#16243d]/5 p-5">
          <div className="flex flex-wrap items-end gap-4">
            {filters.map(filter => (
              <FilterField
                key={filter.key}
                filter={filter}
                value={values[filter.key] || ""}
                onChange={value => onChange(filter.key, value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterField({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  if (filter.type === "select" && filter.options) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
          {filter.label}
        </label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-10 w-48 border-[#16243d]/15 bg-white text-sm">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (filter.type === "date") {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
          {filter.label}
        </label>
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-10 w-48 rounded-lg border border-[#16243d]/15 bg-white px-3 text-sm"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
        {filter.label}
      </label>
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={filter.placeholder}
        className="h-10 w-48 border-[#16243d]/15 bg-white text-sm"
      />
    </div>
  );
}
