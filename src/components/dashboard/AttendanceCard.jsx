import React, { useEffect, useState, useCallback } from "react";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { motion } from "framer-motion";

// Animation variants
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.5,
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
  },
};

const iconVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    rotate: -10,
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const countUpVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.3,
    },
  },
};

const titleVariants = {
  hidden: {
    opacity: 0,
    y: 5,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.4,
    },
  },
};

// Memoized CountUp component to prevent unnecessary re-renders
const AnimatedCount = ({ isLoading, loopKey, parsedValue }) => {
  if (isLoading) {
    return (
      <motion.div variants={countUpVariants} key={`loading-${loopKey}`}>
        <CountUp
          start={0}
          end={Math.floor(Math.random() * 1000) + 100}
          duration={0.8}
          separator=","
        />
      </motion.div>
    );
  }

  return (
    <motion.div variants={countUpVariants} key={`count-${parsedValue}`}>
      <CountUp
        start={0}
        end={parsedValue}
        duration={1.8}
        separator=","
        preserveValue
      />
    </motion.div>
  );
};

AnimatedCount.displayName = "AnimatedCount";

function AttendanceCard({
  title,
  count,
  icon,
  isLoading,
  delay = 0, // Optional delay for staggered animations
}) {
  const navigate = useNavigate();
  const setActiveFilter = useAttendanceStore((state) => state.setActiveFilter);
  const [loopKey, setLoopKey] = useState(0);

  // Memoize parsed value to prevent recalculation on every render
  const parsedValue =
    (() => {
      return Number(String(count || 0).replace(/[^0-9]/g, "")) || 0;
    },
    [count]);

  // Memoize the filter mapping to prevent recreation on every render
  const filterMap =
    (() => ({
      "Total Employees": "all",
      Present: "present",
      Absent: "absent",
      "Late Punch": "all",
    }),
    []);

  // Optimized loading animation with cleanup
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoopKey((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Memoized navigation handler
  const handleRedirect = useCallback(() => {
    try {
      const filter = filterMap[title];
      if (filter) {
        setActiveFilter(filter);
        navigate("/attendance");
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }, [title, filterMap, setActiveFilter, navigate]);

  // Memoized keyboard handler
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleRedirect();
      }
    },
    [handleRedirect]
  );

  // Enhanced variants with delay
  const enhancedCardVariants =
    (() => ({
      ...cardVariants,
      visible: {
        ...cardVariants.visible,
        transition: {
          ...cardVariants.visible.transition,
          delay: delay * 0.1, // Staggered delay based on prop
        },
      },
    }),
    [delay]);

  return (
    <motion.div
      variants={enhancedCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className="bg-white border border-[#E0E0E0] rounded-xl px-[22px] py-[36px] flex items-center justify-between cursor-pointer relative overflow-hidden"
      onClick={handleRedirect}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`View ${title} details`}
    >
      {/* Background gradient effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">
        <motion.h2
          className="text-2xl font-bold text-gray-800"
          variants={countUpVariants}
        >
          <AnimatedCount
            isLoading={isLoading}
            loopKey={loopKey}
            parsedValue={parsedValue}
          />
        </motion.h2>

        <motion.p
          className="text-gray-500 text-[14px] mt-1"
          variants={titleVariants}
        >
          {title}
        </motion.p>
      </div>

      <motion.div
        variants={iconVariants}
        className="bg-gray-100 p-3 rounded-full flex items-center justify-center relative z-10"
        whileHover="hover"
      >
        {icon}

        {/* Pulse effect for loading state */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-blue-200 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 bg-blue-100 rounded-xl opacity-0"
        whileTap={{ opacity: 0.2 }}
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  );
}

// Export memoized component
export default AttendanceCard;
