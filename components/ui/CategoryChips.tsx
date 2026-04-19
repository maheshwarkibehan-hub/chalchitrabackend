"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CategoryChipsProps = {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
  className?: string;
};

export default function CategoryChips({ categories, active, onChange, className }: CategoryChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  const hasOverflow = useMemo(() => categories.length > 6, [categories.length]);

  function updateScrollState() {
    const el = containerRef.current;
    if (!el) return;

    setCanScroll({
      left: el.scrollLeft > 0,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }

  function scrollByAmount(amount: number) {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
    requestAnimationFrame(updateScrollState);
  }

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      {hasOverflow && canScroll.left && (
        <button
          type="button"
          className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-yt-border bg-yt-base text-yt-textPrimary shadow-sm"
          onClick={() => scrollByAmount(-240)}
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={containerRef}
        onScroll={updateScrollState}
        className="no-scrollbar flex w-full items-center gap-3 overflow-x-auto px-10 py-1"
      >
        {categories.map((category) => {
          const activeChip = category === active;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-sm font-medium transition",
                activeChip
                  ? "bg-yt-chipSelected text-yt-textChipSelected"
                  : "bg-yt-chip text-yt-textPrimary hover:bg-[#e7e7e7]",
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      {hasOverflow && canScroll.right && (
        <button
          type="button"
          className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-yt-border bg-yt-base text-yt-textPrimary shadow-sm"
          onClick={() => scrollByAmount(240)}
          aria-label="Scroll categories right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
