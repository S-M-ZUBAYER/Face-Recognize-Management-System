import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function EmployeeFilterTabs({ filters, activeFilter, onFilterChange }) {
  const containerRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const checkScrollTimeoutRef = useRef(null);

  // Improved scroll checking with debouncing
  const checkScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any pending timeout
    if (checkScrollTimeoutRef.current) {
      clearTimeout(checkScrollTimeoutRef.current);
    }

    // Use RAF for better performance
    checkScrollTimeoutRef.current = setTimeout(() => {
      const { scrollLeft, clientWidth, scrollWidth } = container;

      // Add small threshold to prevent flickering
      const threshold = 1;

      setShowLeft(scrollLeft > threshold);
      setShowRight(scrollLeft + clientWidth < scrollWidth - threshold);
    }, 10);
  }, []);

  // Force recheck when filters change
  useEffect(() => {
    const forceCheck = () => {
      // Use RAF to ensure DOM is updated
      requestAnimationFrame(() => {
        checkScroll();
      });
    };

    forceCheck();
  }, [filters, checkScroll]);

  // Setup scroll and resize listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial check
    checkScroll();

    // Event listeners
    container.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    // Observer for content changes
    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(container);

    return () => {
      if (checkScrollTimeoutRef.current) {
        clearTimeout(checkScrollTimeoutRef.current);
      }
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const scrollByAmount = useCallback(
    (amount) => {
      const container = containerRef.current;
      if (!container) return;

      container.scrollBy({
        left: amount,
        behavior: "smooth",
      });

      // Force recheck after scroll completes
      setTimeout(checkScroll, 150);
    },
    [checkScroll]
  );

  const scrollToStart = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  }, []);

  const scrollToEnd = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      left: container.scrollWidth,
      behavior: "smooth",
    });
  }, []);

  // Loading state
  if (!filters || filters.length === 0) {
    return (
      <div className="relative w-[78vw]">
        <div className="flex items-center">
          <div className="flex gap-2 px-8">
            {/* Loading skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="px-6 py-3 rounded-full bg-gray-200 animate-pulse"
                style={{ width: `${80 + i * 20}px`, height: "44px" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[78vw]">
      <div className="flex items-center">
        {/* Left Button */}
        {showLeft && (
          <button
            className="absolute left-0 h-[2vw] w-[2vw] px-2 bg-[#004368] shadow-md text-[#EAEAEA] rounded-full z-20"
            onClick={() => scrollByAmount(-200)}
            onDoubleClick={scrollToStart}
            aria-label="Scroll left"
            title="Click to scroll left, double-click to go to start"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Scrollable Filters */}
        <div
          ref={containerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-8"
          style={{ scrollBehavior: "smooth" }}
          role="tablist"
          aria-label="Filter options"
        >
          {filters.map((filter, index) => (
            <button
              key={`${filter}-${index}`}
              className={`px-6 py-3 rounded-full border border-[#B0C5D0] font-[550] text-[16px] whitespace-nowrap flex-shrink-0 transition-colors duration-200 ${
                activeFilter === filter
                  ? "bg-[#004368] text-[#E6ECF0]"
                  : "bg-white text-[#B0C5D0] hover:bg-gray-50"
              }`}
              onClick={() => onFilterChange(filter)}
              role="tab"
              aria-selected={activeFilter === filter}
              aria-label={`Filter by ${filter}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Right Button */}
        {showRight && (
          <button
            className="absolute right-0 z-20 h-[2vw] w-[2vw] px-2 bg-[#004368] shadow-md text-[#EAEAEA] rounded-full"
            onClick={() => scrollByAmount(200)}
            onDoubleClick={scrollToEnd}
            aria-label="Scroll right"
            title="Click to scroll right, double-click to go to end"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

export default EmployeeFilterTabs;
