import React, { useState, useEffect, useCallback, memo } from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

// Constants
const WARNING_ROUTES = {
  RULES: "/Face_Attendance_Management_System/rules",
  PAY_PERIOD: "/Face_Attendance_Management_System/pay-period",
};

const STORAGE_KEYS = {
  RULES: "hideWarningModalRules",
  PAY_PERIOD: "hideWarningModalPayPeriod",
};

const ANIMATION_CONFIG = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  modal: {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.95, opacity: 0, y: 20 },
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
};

// Utility Functions
const getRouteType = (pathname) => {
  if (pathname === WARNING_ROUTES.RULES) return "RULES";
  if (pathname === WARNING_ROUTES.PAY_PERIOD) return "PAY_PERIOD";
  return null;
};

const shouldShowWarning = (pathname) => {
  const routeType = getRouteType(pathname);
  if (!routeType) return false;

  const storageKey = STORAGE_KEYS[routeType];
  return !localStorage.getItem(storageKey);
};

const saveWarningPreference = (pathname) => {
  const routeType = getRouteType(pathname);
  if (!routeType) return;

  const storageKey = STORAGE_KEYS[routeType];
  localStorage.setItem(storageKey, "true");
};

// Memoized Components
const ModalHeader = memo(({ onClose }) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-100">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-amber-100">
        <AlertTriangle className="w-6 h-6 text-amber-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Important Warning
        </h3>
        <p className="text-sm text-gray-500">Changes affect all employees</p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label="Close modal"
    >
      <X className="w-5 h-5 text-gray-500" />
    </button>
  </div>
));
ModalHeader.displayName = "ModalHeader";

const WarningContent = memo(() => (
  <div className="p-6">
    <div className="space-y-4">
      <p className="text-gray-700">
        You are about to modify{" "}
        <span className="font-semibold text-amber-600">global settings</span>.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
            <span>
              Changes made here will apply to <strong>all employees</strong> in
              the system
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
            <span>
              This includes existing rules, pay periods, and salary calculations
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
            <span>Review changes carefully before saving</span>
          </li>
        </ul>
      </div>

      <p className="text-sm text-gray-600">
        Proceed only if you intend to update settings for the entire
        organization.
      </p>
    </div>
  </div>
));
WarningContent.displayName = "WarningContent";

const ModalFooter = memo(({ dontShowAgain, onToggleDontShow, onClose }) => (
  <div className="flex flex-col gap-3 p-6 border-t border-gray-100 bg-gray-50">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={dontShowAgain}
        onChange={(e) => onToggleDontShow(e.target.checked)}
        className="w-4 h-4 text-[#004368] border-gray-300 rounded focus:ring-[#004368]"
      />
      <span className="text-sm text-gray-700">
        Don't show this warning again
      </span>
    </label>

    <div className="flex gap-3">
      <button
        onClick={onClose}
        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onClose}
        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#004368] rounded-lg hover:bg-[#003155] transition-colors"
      >
        I Understand
      </button>
    </div>
  </div>
));
ModalFooter.displayName = "ModalFooter";

// Main Component
const WarningModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const show = shouldShowWarning(location.pathname);
    setIsOpen(show);
  }, [location.pathname]);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      saveWarningPreference(location.pathname);
    }
    setIsOpen(false);
  }, [dontShowAgain, location.pathname]);

  const handleToggleDontShow = useCallback((checked) => {
    setDontShowAgain(checked);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          {...ANIMATION_CONFIG.backdrop}
          className="absolute inset-0 bg-black/5 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          {...ANIMATION_CONFIG.modal}
          className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden z-10"
        >
          <ModalHeader onClose={handleClose} />
          <WarningContent />
          <ModalFooter
            dontShowAgain={dontShowAgain}
            onToggleDontShow={handleToggleDontShow}
            onClose={handleClose}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default memo(WarningModal);
