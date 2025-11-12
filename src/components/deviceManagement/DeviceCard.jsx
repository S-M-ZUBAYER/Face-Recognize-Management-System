import React, { memo } from "react";
import { motion } from "framer-motion";
import image from "@/constants/image";

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
      damping: 24,
      duration: 0.4,
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow:
      "0 10px 25px -5px rgba(0, 67, 104, 0.1), 0 4px 6px -2px rgba(0, 67, 104, 0.05)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "tween",
      duration: 0.1,
    },
  },
};

const imageVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.1,
    },
  },
  hover: {
    scale: 1.05,
    rotate: 2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1 + 0.3,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

// Constants
const INFO_ITEMS_LABELS = {
  deviceName: "Device Name",
  MacAddress: "MAC Address",
  EmployeeCount: "Employee",
};

const DeviceCard = memo(({ deviceName, MacAddress, EmployeeCount }) => {
  const infoItems = [
    { label: INFO_ITEMS_LABELS.deviceName, value: deviceName },
    { label: INFO_ITEMS_LABELS.MacAddress, value: MacAddress },
    { label: INFO_ITEMS_LABELS.EmployeeCount, value: EmployeeCount },
  ];

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className="border border-[#E6ECF0] py-4 px-4 rounded-lg bg-white cursor-pointer group"
      style={{ willChange: "transform" }}
    >
      {/* Image Section */}
      <motion.div
        className="flex items-center justify-center pb-6"
        variants={imageVariants}
      >
        <img
          src={image.product}
          alt="Device Icon"
          className="w-28 transition-all duration-300 group-hover:drop-shadow-md"
        />
      </motion.div>

      {/* Info Section */}
      <div className="pb-4 font-poppins space-y-3">
        {infoItems.map(({ label, value }, index) => (
          <motion.div
            key={label}
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between"
          >
            <motion.p
              className="text-[#004368] text-[12px] font-poppins-regular font-[500]"
              whileHover={{ color: "#002c44" }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.p>
            <motion.p
              className="text-[#464646] font-poppins-regular font-[400] text-[12px] truncate  ml-2"
              title={value}
              whileHover={{
                color: "#1a1a1a",
                scale: 1.02,
              }}
              transition={{ duration: 0.2 }}
            >
              {value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Subtle hover border effect */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#004368]/10"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
});

DeviceCard.displayName = "DeviceCard";

export default DeviceCard;
