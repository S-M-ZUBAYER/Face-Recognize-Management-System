import React, { useEffect, useState, useCallback, useMemo } from "react";
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

// Memoized CountUp component for loading state with continuous animation
const LoadingCount = React.memo(({ loopKey }) => {
  const [randomValue, setRandomValue] = useState(0);

  // Continuous random value generation for smooth animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRandomValue(Math.floor(Math.random() * 1000) + 100);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div variants={countUpVariants} key={`loading-${loopKey}`}>
      <CountUp
        start={0}
        end={randomValue}
        duration={1.2}
        separator=","
        decimals={0}
      />
    </motion.div>
  );
});

LoadingCount.displayName = "LoadingCount";

// Memoized CountUp component for actual count
const ActualCount = React.memo(({ parsedValue }) => {
  return (
    <motion.div variants={countUpVariants} key={`count-${parsedValue}`}>
      <CountUp
        start={0}
        end={parsedValue}
        duration={2}
        separator=","
        preserveValue
        decimals={0}
      />
    </motion.div>
  );
});

ActualCount.displayName = "ActualCount";

function AttendanceCard({ title, count, icon, isLoading, delay = 0 }) {
  const navigate = useNavigate();
  const setActiveFilter = useAttendanceStore((state) => state.setActiveFilter);
  const [loopKey, setLoopKey] = useState(0);

  // Fixed: Properly memoized parsed value calculation
  const parsedValue = useMemo(() => {
    const num = Number(String(count || 0).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : Math.max(0, num);
  }, [count]);

  // Fixed: Memoize the filter mapping properly
  const filterMap = useMemo(
    () => ({
      "Total Employees": "all",
      Present: "present",
      Absent: "absent",
      "Late Punch": "late",
    }),
    []
  );

  // Fixed: Continuous loading animation
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoopKey((prev) => prev + 1);
      }, 1500);

      return () => clearInterval(interval);
    } else {
      setLoopKey(0); // Reset when not loading
    }
  }, [isLoading]);

  // Fixed: Memoized navigation handler
  const handleRedirect = useCallback(() => {
    try {
      const filter = filterMap[title];
      if (filter) {
        setActiveFilter(filter);
        navigate("/Face_Attendance_Management_System/attendance");
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }, [title, filterMap, setActiveFilter, navigate]);

  // Fixed: Memoized keyboard handler
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleRedirect();
      }
    },
    [handleRedirect]
  );

  // Fixed: Enhanced variants with delay
  const enhancedCardVariants = useMemo(
    () => ({
      ...cardVariants,
      visible: {
        ...cardVariants.visible,
        transition: {
          ...cardVariants.visible.transition,
          delay: delay * 0.1,
        },
      },
    }),
    [delay]
  );

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
        <motion.div
          className="text-2xl font-bold text-gray-800"
          variants={countUpVariants}
        >
          {isLoading ? (
            <LoadingCount loopKey={loopKey} />
          ) : (
            <ActualCount parsedValue={parsedValue} />
          )}
        </motion.div>

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
              duration: 1.5,
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
export default React.memo(AttendanceCard);
