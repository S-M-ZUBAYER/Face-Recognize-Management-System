import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function FancyLoader() {
  const text = "Loading...";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      setIndex((prev) => {
        if (prev === text.length) {
          return 0;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [index, text]);

  return (
    <div className="flex items-center justify-center h-[70vh] bg-white">
      <motion.h1
        className="text-3xl font-bold text-[#004368]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {displayedText}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="ml-1"
        >
          |
        </motion.span>
      </motion.h1>
    </div>
  );
}
