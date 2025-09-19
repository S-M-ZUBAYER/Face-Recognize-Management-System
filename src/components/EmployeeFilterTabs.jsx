import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // optional, or replace with text/icons

function EmployeeFilterTabs({ filters, activeFilter, onFilterChange }) {
  const containerRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // check visibility of scroll buttons
  const checkScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    setShowLeft(container.scrollLeft > 0);
    setShowRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth
    );
  };

  useEffect(() => {
    checkScroll();
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollByAmount = (amount) => {
    containerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative w-[78vw]">
      <div className="flex items-center">
        {/* Left Button */}
        {showLeft && (
          <button
            className="absolute left-0 h-[2vw] w-[2vw] px-2 bg-[#004368] shadow-md text-[#EAEAEA] rounded-full"
            onClick={() => scrollByAmount(-200)}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Scrollable Filters */}
        <div
          ref={containerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-8"
          style={{ scrollBehavior: "smooth" }}
        >
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`px-6 py-3 rounded-full border border-[#B0C5D0] font-[550] text-[16px] whitespace-nowrap flex-shrink-0 ${
                activeFilter === filter
                  ? "bg-[#004368] text-[#E6ECF0]"
                  : "bg-white text-[#B0C5D0]"
              }`}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Right Button */}
        {showRight && (
          <button
            className="absolute right-0 z-10 h-[2vw] w-[2vw] px-2 bg-[#004368] shadow-md text-[#EAEAEA] rounded-full "
            onClick={() => scrollByAmount(200)}
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

export default EmployeeFilterTabs;
