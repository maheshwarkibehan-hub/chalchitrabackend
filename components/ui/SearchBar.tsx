"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Clock3, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

type SearchBarProps = {
  className?: string;
  initialValue?: string;
  compact?: boolean;
};

export default function SearchBar({ className, initialValue, compact = false }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialValue ?? fromQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const addSearchHistory = useAppStore((state) => state.addSearchHistory);
  const searchHistory = useAppStore((state) => state.searchHistory);
  const removeSearchHistory = useAppStore((state) => state.removeSearchHistory);

  useEffect(() => {
    function closeDropdown(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(normalized)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 10) : []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const recentItems = useMemo(() => searchHistory.slice(0, 8), [searchHistory]);

  function submitSearch(value?: string) {
    const finalValue = (value ?? query).trim();
    if (!finalValue) return;
    addSearchHistory(finalValue);
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(finalValue)}`);
  }

  const showDropdown = isOpen && (recentItems.length > 0 || suggestions.length > 0 || loading);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="flex items-center gap-2">
        {!compact && (
          <button
            type="button"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yt-chip text-yt-textPrimary hover:bg-yt-hover md:flex"
            aria-label="Voice search"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        <div className="flex min-w-0 flex-1 items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitSearch();
              }
            }}
            placeholder="Search"
            className="h-10 w-full rounded-l-full border border-yt-border bg-yt-input px-4 text-base text-yt-textPrimary shadow-sm outline-none transition placeholder:text-yt-textSecondary focus:border-yt-likeActive"
          />
          <button
            type="button"
            onClick={() => submitSearch()}
            className="flex h-10 w-16 items-center justify-center rounded-r-full border border-l-0 border-yt-border bg-[#f8f8f8] text-yt-textPrimary hover:bg-yt-hover"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-ytMenu border border-yt-border bg-yt-elevated py-2 shadow-sm">
          {recentItems.map((item) => (
            <div
              key={`recent-${item}`}
              className="group flex items-center gap-3 px-3 py-2 text-sm text-yt-textPrimary hover:bg-yt-hover"
            >
              <Clock3 className="h-4 w-4 text-yt-textSecondary" />
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left"
                onClick={() => {
                  setQuery(item);
                  submitSearch(item);
                }}
              >
                {item}
              </button>
              <button
                type="button"
                className="opacity-0 transition group-hover:opacity-100"
                onClick={() => removeSearchHistory(item)}
                aria-label="Remove search history item"
              >
                <X className="h-4 w-4 text-yt-textSecondary" />
              </button>
            </div>
          ))}

          {suggestions.map((suggestion) => (
            <div
              key={`s-${suggestion}`}
              className="group flex items-center gap-3 px-3 py-2 text-sm text-yt-textPrimary hover:bg-yt-hover"
            >
              <Search className="h-4 w-4 text-yt-textSecondary" />
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left"
                onClick={() => {
                  setQuery(suggestion);
                  submitSearch(suggestion);
                }}
              >
                {suggestion}
              </button>
              <button
                type="button"
                onClick={() => setQuery(suggestion)}
                aria-label="Fill query"
              >
                <ArrowUpRight className="h-4 w-4 text-yt-textSecondary" />
              </button>
            </div>
          ))}

          {loading && <p className="px-3 py-2 text-xs text-yt-textSecondary">Loading suggestions...</p>}
        </div>
      )}
    </div>
  );
}
