import React from "react";
import { motion } from "framer-motion";

export default function RunningManLoader() {
  return (
    <div className="flex items-center justify-center h-[65vh] bg-transparent ">
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ x: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut" }}
      >
        {/* Head */}
        <circle
          cx="50"
          cy="15"
          r="8"
          stroke="#004368"
          strokeWidth="3"
          fill="white"
        />

        {/* Body */}
        <line
          x1="50"
          y1="23"
          x2="50"
          y2="50"
          stroke="#004368"
          strokeWidth="3"
        />

        {/* Left Arm */}
        <motion.line
          x1="50"
          y1="30"
          x2="30"
          y2="40"
          stroke="#004368"
          strokeWidth="3"
          animate={{ rotate: [20, -20, 20] }}
          transition={{ repeat: Infinity, duration: 0.4 }}
          style={{ originX: "50px", originY: "30px" }}
        />

        {/* Right Arm */}
        <motion.line
          x1="50"
          y1="30"
          x2="70"
          y2="40"
          stroke="#004368"
          strokeWidth="3"
          animate={{ rotate: [-20, 20, -20] }}
          transition={{ repeat: Infinity, duration: 0.4 }}
          style={{ originX: "50px", originY: "30px" }}
        />

        {/* Left Leg */}
        <motion.line
          x1="50"
          y1="50"
          x2="35"
          y2="70"
          stroke="#004368"
          strokeWidth="3"
          animate={{ rotate: [-30, 30, -30] }}
          transition={{ repeat: Infinity, duration: 0.4 }}
          style={{ originX: "50px", originY: "50px" }}
        />

        {/* Right Leg */}
        <motion.line
          x1="50"
          y1="50"
          x2="65"
          y2="70"
          stroke="#004368"
          strokeWidth="3"
          animate={{ rotate: [30, -30, 30] }}
          transition={{ repeat: Infinity, duration: 0.4 }}
          style={{ originX: "50px", originY: "50px" }}
        />
      </motion.svg>
    </div>
  );
}
