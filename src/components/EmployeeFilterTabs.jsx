import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Constants
const SCROLL_MULTIPLIER = 2;
const ANIMATION_DELAY_INCREMENT = 0.05;
const SKELETON_ITEMS = [1, 2, 3, 4];

const ANIMATION_CONFIG = {
  scrollIndicator: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: 0.3 },
  },
  progressBar: {
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  dragHint: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.5 },
  },
  filterButton: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.98 },
  },
};

// Custom Hooks
const useScrollIndicator = (containerRef, filters) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const checkScrollable = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { clientWidth, scrollWidth, scrollLeft } = container;
    const isScrollable = scrollWidth > clientWidth;
    setShowScrollIndicator(isScrollable);

    const maxScroll = scrollWidth - clientWidth;
    const percentage = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    setScrollPercentage(percentage);
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScrollable();

    const resizeObserver = new ResizeObserver(checkScrollable);
    resizeObserver.observe(container);

    const handleScroll = () => checkScrollable();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkScrollable);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollable);
    };
  }, [checkScrollable, filters]);

  return { showScrollIndicator, scrollPercentage };
};

const useDragScroll = (containerRef) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleDragStart = useCallback(
    (e) => {
      const container = containerRef.current;
      if (!container) return;

      const clientX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;

      setIsDragging(true);
      setStartX(clientX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);

      container.style.cursor = "grabbing";
      container.style.userSelect = "none";
    },
    [containerRef],
  );

  const handleDragMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const container = containerRef.current;
      if (!container) return;

      const clientX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
      const x = clientX - container.offsetLeft;
      const walk = (x - startX) * SCROLL_MULTIPLIER;

      container.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft, containerRef],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const container = containerRef.current;
    if (container) {
      container.style.cursor = "grab";
      container.style.userSelect = "auto";
    }
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mouseDownHandler = (e) => {
      e.preventDefault();
      handleDragStart(e);
    };

    container.addEventListener("mousedown", mouseDownHandler);
    container.addEventListener("touchstart", handleDragStart, {
      passive: true,
    });

    return () => {
      container.removeEventListener("mousedown", mouseDownHandler);
      container.removeEventListener("touchstart", handleDragStart);
    };
  }, [handleDragStart, containerRef]);

  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDragMove, { passive: true });
    document.addEventListener("touchend", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return { isDragging };
};

// Memoized Components
const SkeletonLoader = memo(() => (
  <div className="relative w-[78vw]">
    <div className="flex gap-2 px-4">
      {SKELETON_ITEMS.map((i) => (
        <div
          key={i}
          className="px-6 py-3 rounded-full bg-gray-200 animate-pulse"
          style={{ width: `${80 + i * 20}px`, height: "44px" }}
        />
      ))}
    </div>
  </div>
));
SkeletonLoader.displayName = "SkeletonLoader";

const FilterButton = memo(({ filter, isActive, onClick, index }) => (
  <motion.button
    className={`px-4 py-3 rounded-full border font-[550] text-[0.7vw] whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
      isActive
        ? "bg-[#004368] text-[#E6ECF0] border-[#004368] scale-105 shadow-md"
        : "bg-white text-[#B0C5D0] border-[#B0C5D0] hover:bg-gray-50"
    }`}
    onClick={onClick}
    {...ANIMATION_CONFIG.filterButton}
    role="tab"
    aria-selected={isActive}
    aria-label={`Filter by ${filter}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * ANIMATION_DELAY_INCREMENT }}
  >
    {filter}
  </motion.button>
));
FilterButton.displayName = "FilterButton";

const ScrollProgressBar = memo(({ scrollPercentage }) => (
  <motion.div
    className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-full overflow-hidden"
    {...ANIMATION_CONFIG.scrollIndicator}
  >
    <motion.div
      className="h-full bg-[#004368] rounded-full"
      initial={{ width: "0%" }}
      animate={{ width: `${scrollPercentage}%` }}
      {...ANIMATION_CONFIG.progressBar}
    />
  </motion.div>
));
ScrollProgressBar.displayName = "ScrollProgressBar";

const DragHint = memo(() => (
  <motion.div
    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs text-gray-400"
    {...ANIMATION_CONFIG.dragHint}
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
));
DragHint.displayName = "DragHint";

const DraggingOverlay = memo(() => (
  <AnimatePresence>
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
  </AnimatePresence>
));
DraggingOverlay.displayName = "DraggingOverlay";

// Main Component
const EmployeeFilterTabs = ({ filters, activeFilter, onFilterChange }) => {
  const containerRef = useRef(null);
  const { showScrollIndicator, scrollPercentage } = useScrollIndicator(
    containerRef,
    filters,
  );
  const { isDragging } = useDragScroll(containerRef);

  const handleFilterClick = useCallback(
    (filter) => {
      if (!isDragging) {
        onFilterChange(filter);
      }
    },
    [isDragging, onFilterChange],
  );

  if (!filters?.length) {
    return <SkeletonLoader />;
  }

  return (
    <div className="relative w-[78vw]">
      <div className="relative">
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
        >
          {filters.map((filter, index) => (
            <FilterButton
              key={`${filter}-${index}`}
              filter={filter}
              isActive={activeFilter === filter}
              onClick={() => handleFilterClick(filter)}
              index={index}
            />
          ))}
        </div>

        {showScrollIndicator && (
          <ScrollProgressBar scrollPercentage={scrollPercentage} />
        )}
        {showScrollIndicator && <DragHint />}
      </div>

      {isDragging && <DraggingOverlay />}
    </div>
  );
};

export default memo(EmployeeFilterTabs);
