import React, { useEffect, useRef, useState } from "react";
import NavButton from "../components/NavButton";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES = [
  "All",
  "Music",
  "Comdedy Clubs",
  "Podcast",
  "Mixes",
  "News",
  "Web Development",
  "Gaming",
  "Pakistan national cricket team",
  "Live",
  "Game shows",
  "History",
  "Sports",
  "Indian pop music",
  "Roast",
  "Drama",
  "Data Structures",
  "Qawwali music",
  "Recently uplaoded",
  "Watched",
  "New to you",
];

const SCROLL_AMOUNT = 200; // pixels to scroll per click
const SCROLL_THRESHOLD = 1; // pixel threshold to prevent floating point issues

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Checks if scroll container can scroll left
 * @param {HTMLElement} container - Scroll container element
 * @returns {boolean} True if not at start position
 */
const canScrollLeft = (container) => {
  if (!container) return false;
  return container.scrollLeft > 0;
};

/**
 * Checks if scroll container can scroll right
 * @param {HTMLElement} container - Scroll container element
 * @returns {boolean} True if not at end position
 */
const canScrollRight = (container) => {
  if (!container) return false;
  const { scrollLeft, scrollWidth, clientWidth } = container;
  return scrollLeft < scrollWidth - clientWidth - SCROLL_THRESHOLD;
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ButtonList Component
 * Horizontal scrollable category filter list with scroll controls
 * Shows left/right arrows only when scroll is possible
 * 
 * @component
 * @returns {React.ReactElement} Category filter list with scroll navigation
 */
const ButtonList = () => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeftFlag, setCanScrollLeftFlag] = useState(false);
  const [canScrollRightFlag, setCanScrollRightFlag] = useState(false);

  /**
   * Updates arrow visibility based on current scroll position
   */
  const updateScrollArrows = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeftFlag(canScrollLeft(container));
    setCanScrollRightFlag(canScrollRight(container));
  };

  /**
   * Scrolls container left by SCROLL_AMOUNT
   */
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -SCROLL_AMOUNT,
        behavior: "smooth",
      });
    }
  };

  /**
   * Scrolls container right by SCROLL_AMOUNT
   */
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: SCROLL_AMOUNT,
        behavior: "smooth",
      });
    }
  };

  /**
   * Setup scroll position listeners on mount/unmount
   */
  useEffect(() => {
    updateScrollArrows();
    const scrollContainer = scrollContainerRef.current;

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", updateScrollArrows);
      window.addEventListener("resize", updateScrollArrows);

      return () => {
        scrollContainer.removeEventListener("scroll", updateScrollArrows);
        window.removeEventListener("resize", updateScrollArrows);
      };
    }
  }, []);

  return (
    <div className="sticky top-[52px] bg-white z-10 pb-3 pt-3">
      {/* Left Scroll Arrow - Hidden when at start */}
      {canScrollLeftFlag && (
        <button
          onClick={handleScrollLeft}
          className="absolute -left-2 bottom-1 h-full w-6 z-10 flex items-center justify-start cursor-pointer"
          aria-label="Scroll categories left"
          type="button"
          title="Scroll left"
        >
          <div className="bg-white rounded-full p-1 hover:bg-gray-200 transition-colors">
            <ChevronLeftIcon fontSize="small" />
          </div>
        </button>
      )}

      {/* Category List - Horizontally Scrollable */}
      <div ref={scrollContainerRef} className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 px-2">
          {CATEGORIES.map((categoryName) => (
            <NavButton key={categoryName} name={categoryName} />
          ))}
        </div>
      </div>

      {/* Right Scroll Arrow - Hidden when at end */}
      {canScrollRightFlag && (
        <button
          onClick={handleScrollRight}
          className="absolute -right-2 bottom-1 h-full w-6 z-10 flex items-center justify-end cursor-pointer"
          aria-label="Scroll categories right"
          type="button"
          title="Scroll right"
        >
          <div className="bg-white rounded-full p-1 hover:bg-gray-200 transition-colors">
            <ChevronRightIcon fontSize="small" />
          </div>
        </button>
      )}
    </div>
  );
};

export default ButtonList;
