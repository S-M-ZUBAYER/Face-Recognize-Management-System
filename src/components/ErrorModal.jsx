// components/ErrorModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertCircle,
  RefreshCw,
  WifiOff,
  Server,
  Clock,
} from "lucide-react";
import useErrorStore from "@/zustand/useErrorStore";
import { useEffect } from "react";

const ErrorModal = () => {
  const { error, isOpen, hideError } = useErrorStore();

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        hideError();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, hideError]);

  const getErrorIcon = () => {
    if (error?.includes("timeout") || error?.includes("Timeout")) {
      return <Clock className="w-6 h-6" />;
    }
    if (
      error?.includes("network") ||
      error?.includes("internet") ||
      error?.includes("Network")
    ) {
      return <WifiOff className="w-6 h-6" />;
    }
    if (error?.includes("server") || error?.includes("Server")) {
      return <Server className="w-6 h-6" />;
    }
    return <AlertCircle className="w-6 h-6" />;
  };

  const getErrorColor = () => {
    if (error?.includes("timeout")) return "text-amber-600";
    if (error?.includes("network")) return "text-blue-600";
    if (error?.includes("server")) return "text-purple-600";
    return "text-red-600";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/7 backdrop-blur-sm z-50"
            onClick={hideError}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 40,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                y: 40,
              }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 400,
                mass: 0.8,
              }}
              className="bg-gradient-to-br from-white to-slate-50/80 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full pointer-events-auto overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="relative p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className={`flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 ${getErrorColor()}`}
                    >
                      {getErrorIcon()}
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
                      >
                        Oops! Something went wrong
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-slate-500 mt-1"
                      >
                        We've encountered an issue
                      </motion.p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={hideError}
                    className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Animated progress bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500/50 to-orange-500/50 origin-left"
                />
              </div>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-6"
              >
                <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-200/60">
                  <p className="text-slate-700 leading-relaxed text-center font-medium">
                    {error}
                  </p>
                </div>

                {/* Quick tips */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 text-xs text-slate-500 text-center"
                >
                  💡 Check your connection and try again
                </motion.div>
              </motion.div>

              {/* Enhanced Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 p-6 bg-gradient-to-t from-slate-50/50 to-white/30"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={hideError}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 shadow-sm"
                >
                  Dismiss
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal;
