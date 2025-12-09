import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Lock, Zap, CheckCircle } from "lucide-react";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";

const SubscriptionRequiredModal = () => {
  const {
    isSubscriptionRequiredModal,
    setIsSubscriptionRequiredModal,
    setIsSubscriptionModal,
  } = useSubscriptionStore();

  // Features list
  const features = [
    "Unlimited salary calculations",
    "Access to advanced analytics",
    "Employee management tools",
    "Export reports in multiple formats",
    "Priority support",
    "Automatic updates",
  ];

  const handleUpgrade = () => {
    // Close required modal and open subscription modal
    setIsSubscriptionRequiredModal(false);
    setIsSubscriptionModal(true);
  };

  if (!isSubscriptionRequiredModal) return null;

  return (
    <AnimatePresence>
      {isSubscriptionRequiredModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/6 backdrop-blur-sm z-[60]"
            onClick={() => setIsSubscriptionRequiredModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-8 text-center">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#004368] to-[#003152]" />

                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#004368]/10 to-[#004368]/5 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-[#004368]" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Subscription Required
                </h2>

                <p className="text-gray-600 leading-relaxed">
                  To access the Salary Calculation feature, please subscribe to
                  a plan that includes this feature.
                </p>
              </div>

              {/* Features List */}
              <div className="px-8 pb-6">
                <div className="bg-gray-50/60 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-[#004368]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Premium Features Included
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsSubscriptionRequiredModal(false)}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Maybe Later
                </button>

                <button
                  onClick={handleUpgrade}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#004368] to-[#003152] rounded-xl hover:shadow-lg hover:shadow-[#004368]/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                </button>
              </div>

              {/* Footer Note */}
              <div className="px-8 pb-6 text-center">
                <p className="text-xs text-gray-500">
                  All plans include a 14-day free trial. No credit card
                  required.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionRequiredModal;
