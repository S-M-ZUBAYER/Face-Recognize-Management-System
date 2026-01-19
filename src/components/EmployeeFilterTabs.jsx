import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

function EmployeeFilterTabs({ filters, activeFilter, onFilterChange }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  // Check if container is scrollable
  const checkScrollable = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { clientWidth, scrollWidth } = container;
    const isScrollable = scrollWidth > clientWidth;
    setShowScrollIndicator(isScrollable);

    // Calculate scroll percentage
    const maxScroll = scrollWidth - clientWidth;
    const currentScroll = container.scrollLeft;
    const percentage = maxScroll > 0 ? (currentScroll / maxScroll) * 100 : 0;
    setScrollPercentage(percentage);
  }, []);

  // Initialize and setup event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScrollable();

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      checkScrollable();
    });
    resizeObserver.observe(container);

    // Handle scroll events
    const handleScroll = () => {
      checkScrollable();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkScrollable);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollable);
    };
  }, [checkScrollable, filters]);

  // Mouse/touch drag functionality
  const handleDragStart = (e) => {
    if (e.type === "mousedown") {
      e.preventDefault();
    }

    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    setStartX((e.clientX || e.touches[0].clientX) - container.offsetLeft);
    setScrollLeft(container.scrollLeft);

    // Add cursor styles
    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  };

  const handleDragMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;

      e.preventDefault();
      const x =
        (e.clientX || e.touches[0].clientX) - containerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Multiply for faster scrolling
      containerRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft],
  );

  const handleDragEnd = () => {
    setIsDragging(false);
    const container = containerRef.current;
    if (container) {
      container.style.cursor = "grab";
      container.style.userSelect = "auto";
    }
  };

  // Setup event listeners for drag
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse events
    container.addEventListener("mousedown", handleDragStart);
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);

    // Touch events
    container.addEventListener("touchstart", handleDragStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleDragMove, { passive: false });
    document.addEventListener("touchend", handleDragEnd);

    return () => {
      container.removeEventListener("mousedown", handleDragStart);
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      container.removeEventListener("touchstart", handleDragStart);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, startX, scrollLeft, handleDragMove]);

  // Loading state
  if (!filters || filters.length === 0) {
    return (
      <div className="relative w-[78vw]">
        <div className="flex items-center">
          <div className="flex gap-2 px-4">
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
      <div className="relative">
        {/* Scrollable Filters with Draggable Area */}
        <div
          ref={containerRef}
          className={`flex gap-3 overflow-x-auto scrollbar-hide px-4 py-2 ${
            showScrollIndicator ? "cursor-grab" : ""
          } ${isDragging ? "cursor-grabbing" : ""}`}
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
          role="tablist"
          aria-label="Filter options"
          onMouseLeave={() => {
            if (!isDragging) {
              const container = containerRef.current;
              if (container) {
                container.style.cursor = "";
              }
            }
          }}
        >
          {filters.map((filter, index) => (
            <motion.button
              key={`${filter}-${index}`}
              className={`px-4 py-3 rounded-full border font-[550] text-[0.7vw] whitespace-nowrap flex-shrink-0 transition-all duration-200 transform ${
                activeFilter === filter
                  ? "bg-[#004368] text-[#E6ECF0] border-[#004368] scale-105 shadow-md"
                  : "bg-white text-[#B0C5D0] border-[#B0C5D0] hover:bg-gray-50 hover:scale-[1.02]"
              }`}
              onClick={() => onFilterChange(filter)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              role="tab"
              aria-selected={activeFilter === filter}
              aria-label={`Filter by ${filter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {filter}
            </motion.button>
          ))}
        </div>

        {/* Scroll Progress Indicator at Bottom */}
        {showScrollIndicator && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-[#004368] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${scrollPercentage}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </motion.div>
        )}

        {/* Visual Drag Hint */}
        {showScrollIndicator && (
          <motion.div
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="animate-pulse rotate-180"
            >
              <path d="M7 10L12 15L17 10" />
            </svg>
            <span>Drag to scroll</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="animate-pulse rotate-180"
            >
              <path d="M7 10L12 15L17 10" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Touch/Mouse Active State Indicator */}
      {isDragging && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/80 text-white rounded-full text-sm">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 17L4 21L4 3L8 7" />
                <path d="M16 7L20 3L20 21L16 17" />
              </svg>
              <span>Dragging to scroll</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default React.memo(EmployeeFilterTabs);
