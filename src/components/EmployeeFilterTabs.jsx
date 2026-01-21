import React, { useRef, useState, useEffect, useCallback, memo } from "react";

// Constants
const SCROLL_MULTIPLIER = 2;
const SKELETON_ITEMS = [1, 2, 3, 4];

// Custom Hooks
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

const FilterButton = memo(({ filter, isActive, onClick }) => (
  <button
    className={`px-4 py-3 rounded-full border font-[550] text-[0.7vw] whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
      isActive
        ? "bg-[#004368] text-[#E6ECF0] border-[#004368] scale-105 shadow-md"
        : "bg-white text-[#B0C5D0] border-[#B0C5D0] hover:bg-gray-50"
    }`}
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    aria-label={`Filter by ${filter}`}
  >
    {filter}
  </button>
));
FilterButton.displayName = "FilterButton";

// Main Component
const EmployeeFilterTabs = ({ filters, activeFilter, onFilterChange }) => {
  const containerRef = useRef(null);
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
          className={`flex gap-3 overflow-x-auto px-4 py-2 cursor-grab ${
            isDragging ? "cursor-grabbing" : ""
          }`}
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(EmployeeFilterTabs);
