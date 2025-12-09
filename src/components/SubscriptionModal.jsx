import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Globe,
  Calendar,
  Crown,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  usePaymentInfo,
  useSubscriptionData,
} from "@/hook/useSubscriptionData";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";

const SubscriptionModal = () => {
  const currency = "USD";

  const [selectedPackage, setSelectedPackage] = useState(null);
  const { data: packages = [] } = useSubscriptionData();
  const { isSubscriptionModal, setIsSubscriptionModal } =
    useSubscriptionStore();
  const { data: paymentInfo } = usePaymentInfo();
  const [currentPackage, setCurrentPackage] = useState(null);

  // Currency symbol mapping
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    SGD: "S$",
    CNY: "¥",
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 0;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Auto-select current package on mount
  useEffect(() => {
    if (paymentInfo?.paymentStatus === 1) {
      // User has an active subscription
      const currentPackageName = paymentInfo.package_name;
      const userPackage = packages.find(
        (pkg) => pkg.package_name === currentPackageName
      );

      if (userPackage) {
        setCurrentPackage({
          ...userPackage,
          paymentInfo: paymentInfo,
        });
        setSelectedPackage(userPackage);
      }
    } else if (paymentInfo?.paymentStatus === 0) {
      // User has no subscription, auto-select FreeTrial if available
      const freeTrialPackage = packages.find(
        (pkg) => pkg.package_name === "FreeTrial"
      );
      if (freeTrialPackage) {
        setSelectedPackage(freeTrialPackage);
      }
    }
  }, [paymentInfo, packages]);

  // Handle package selection
  const handlePackageSelect = (pkg) => {
    // Don't allow selecting current package again
    if (currentPackage?.id === pkg.id) return;

    // Don't allow downgrading to FreeTrial if already have a paid plan
    if (currentPackage && pkg.package_name === "FreeTrial") {
      // You can show a toast or alert here
      return;
    }

    setSelectedPackage(pkg);
  };

  if (!isSubscriptionModal) return null;

  const isActiveSubscription = paymentInfo?.paymentStatus === 1;
  const expiryDays = isActiveSubscription
    ? getDaysUntilExpiry(paymentInfo.paymentExpireTime)
    : 0;

  return (
    <AnimatePresence>
      {isSubscriptionModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm z-50"
            onClick={() => setIsSubscriptionModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto pointer-events-auto custom-scrollbar "
            >
              {/* Header with Current Subscription Info */}
              <div className="flex flex-col gap-4 p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isActiveSubscription
                        ? "Manage Subscription"
                        : "Choose Your Plan"}
                    </h2>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSubscriptionModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Current Subscription Banner */}
                {isActiveSubscription && currentPackage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-[#004368]/5 to-[#004368]/10 border border-[#004368]/20 rounded-xl p-4 "
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#004368] flex items-center justify-center">
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Current Plan
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {currentPackage.package_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Expires: {formatDate(paymentInfo.paymentExpireTime)}
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            expiryDays > 30
                              ? "bg-green-100 text-green-800"
                              : expiryDays > 7
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {expiryDays > 0
                            ? `${expiryDays} days remaining`
                            : "Expired"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Billing Currency */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="px-6 py-4 "
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Billing Currency:
                  </span>
                  <div className="flex gap-1 ml-2">
                    {["USD", "EUR", "SGD", "CNY"].map((curr) => (
                      <motion.button
                        key={curr}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                          currency === curr
                            ? "bg-[#004368] text-white shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {curr}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Pricing Cards Grid */}
              <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {packages
                    .filter((pkg) => pkg.package_name !== "FreeTrial") // Remove FreeTrial
                    .map((pkg, index) => {
                      const price = pkg[currency];
                      const isSelected = selectedPackage?.id === pkg.id;
                      const isCurrentPackage = currentPackage?.id === pkg.id;
                      const isPopular = pkg.package_name === "Premium";

                      return (
                        <motion.div
                          key={pkg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          whileHover={
                            !isCurrentPackage
                              ? { y: -4, transition: { duration: 0.2 } }
                              : {}
                          }
                          className={`relative border rounded-xl transition-all duration-200 ${
                            isCurrentPackage
                              ? "border-[#004368] bg-[#004368]/5 cursor-default"
                              : "cursor-pointer border-gray-200 hover:border-[#004368]/50 hover:shadow-md"
                          } ${
                            isSelected && !isCurrentPackage
                              ? "border-[#004368] shadow-lg shadow-[#004368]/20"
                              : ""
                          } ${isPopular ? "ring-2 ring-[#004368]/30" : ""}`}
                          onClick={() =>
                            !isCurrentPackage && handlePackageSelect(pkg)
                          }
                        >
                          {/* Current Plan Badge */}
                          {isCurrentPackage && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <div className="px-3 py-1 bg-[#004368] text-white text-xs font-bold rounded-full shadow-md">
                                CURRENT
                              </div>
                            </div>
                          )}

                          {/* Popular Badge */}
                          {isPopular && !isCurrentPackage && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                            >
                              <div className="px-3 py-1 bg-gradient-to-r from-[#004368] to-[#003152] text-white text-xs font-bold rounded-full shadow-md">
                                POPULAR
                              </div>
                            </motion.div>
                          )}

                          <div className="p-4 h-full flex flex-col">
                            {/* Package Name & Duration */}
                            <div className="mb-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {pkg.package_name}
                                </h3>
                                <span className="px-2 py-1 bg-[#004368]/10 text-[#004368] text-xs font-medium rounded">
                                  {pkg.duration_months}{" "}
                                  {pkg.duration_months === 1
                                    ? "Month"
                                    : "Months"}
                                </span>
                              </div>

                              {/* Price Display */}
                              <div className="mb-2">
                                <div className="flex items-baseline">
                                  <span className="text-3xl font-bold text-gray-900">
                                    {currencySymbols[currency]}
                                    {price}
                                  </span>
                                  <span className="text-gray-500 ml-1">
                                    / mo
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Billed every {pkg.duration_months} months
                                </p>
                              </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3 mb-6 flex-1">
                              {/* Common Feature - Employees */}
                              <div className="flex items-center">
                                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700">
                                  Up to 100 employees
                                </span>
                              </div>

                              {/* Package-specific Features */}
                              {pkg.features.map((feature, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 + idx * 0.05 }}
                                  className="flex items-start"
                                >
                                  <Check className="w-4 h-4 text-[#004368] mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-600 leading-tight">
                                    {feature}
                                  </span>
                                </motion.div>
                              ))}
                            </div>

                            {/* Select/Current Button */}
                            <motion.button
                              whileHover={
                                !isCurrentPackage ? { scale: 1.02 } : {}
                              }
                              whileTap={
                                !isCurrentPackage ? { scale: 0.98 } : {}
                              }
                              onClick={(e) => {
                                if (isCurrentPackage) {
                                  e.stopPropagation();
                                  return;
                                }
                                e.stopPropagation();
                                handlePackageSelect(pkg);
                              }}
                              className={`w-full py-3 rounded-lg text-sm font-medium transition-all mt-auto ${
                                isCurrentPackage
                                  ? "bg-gray-300 text-gray-700 cursor-default"
                                  : isSelected
                                  ? "bg-[#004368] text-white shadow-md"
                                  : "bg-[#004368]/10 text-[#004368] hover:bg-[#004368]/20"
                              }`}
                              disabled={isCurrentPackage}
                            >
                              {isCurrentPackage ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Check className="w-4 h-4" />
                                  Active
                                </div>
                              ) : isSelected ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Check className="w-4 h-4" />
                                  Selected
                                </div>
                              ) : (
                                "Select Plan"
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 "
              >
                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-6 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm"
                  >
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Secure payment
                    </span>
                  </motion.div>
                  {/* <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm"
                  >
                    <Zap className="w-4 h-4 text-[#004368]" />
                    <span className="text-sm text-gray-600">
                      Cancel anytime
                    </span>
                  </motion.div> */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm"
                  >
                    <Star className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-gray-600">24/7 support</span>
                  </motion.div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  {/* Selected Package Summary */}
                  {selectedPackage && !currentPackage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="w-full max-w-md"
                    >
                      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Selected Plan
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedPackage.package_name}
                            </p>
                          </div>
                          <div className="text-center sm:text-right">
                            <p className="text-sm text-gray-600">
                              Total:{" "}
                              <span className="font-bold text-[#004368]">
                                {currencySymbols[currency]}
                                {selectedPackage[currency]}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              for {selectedPackage.duration_months} months
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Change Plan Summary */}
                  {selectedPackage &&
                    currentPackage &&
                    selectedPackage.id !== currentPackage.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="w-full max-w-md"
                      >
                        <div className="p-4 bg-gradient-to-r from-[#004368]/5 to-[#004368]/10 rounded-lg border border-[#004368]/20">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-[#004368]" />
                                <span className="text-sm font-medium text-gray-700">
                                  Plan Change
                                </span>
                              </div>
                              <span className="px-3 py-1 bg-[#004368] text-white text-xs font-medium rounded-full">
                                {selectedPackage[currency] >
                                currentPackage[currency]
                                  ? "Upgrade"
                                  : "Add another Package"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  From
                                </p>
                                <p className="font-medium text-gray-900">
                                  {currentPackage.package_name}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 mb-1">To</p>
                                <p className="font-medium text-gray-900">
                                  {selectedPackage.package_name}
                                </p>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">
                                New total:{" "}
                                <span className="font-bold text-[#004368]">
                                  {currencySymbols[currency]}
                                  {selectedPackage[currency]} /{" "}
                                  {selectedPackage.duration_months} months
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  {/* Continue Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (selectedPackage) {
                        // Handle subscription logic here
                        console.log("Selected package:", selectedPackage);
                        console.log("Current package:", currentPackage);
                        console.log("Payment info:", paymentInfo);

                        // Determine action type
                        const action = currentPackage
                          ? selectedPackage.id === currentPackage.id
                            ? "renew"
                            : "change"
                          : "subscribe";

                        console.log(`Action: ${action}`);

                        // You can add your payment processing logic here
                        // Handle renew, upgrade, Add another Package, or new subscription
                      }
                    }}
                    disabled={
                      !selectedPackage ||
                      (currentPackage &&
                        selectedPackage.id === currentPackage.id)
                    }
                    className={`px-8 py-3 text-sm font-semibold rounded-lg flex items-center gap-2 shadow-md transition-all ${
                      selectedPackage &&
                      !(
                        currentPackage &&
                        selectedPackage.id === currentPackage.id
                      )
                        ? "bg-gradient-to-r from-[#004368] to-[#003152] text-white hover:shadow-lg"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {currentPackage &&
                    selectedPackage &&
                    selectedPackage.id === currentPackage.id
                      ? "Current Plan Active"
                      : currentPackage
                      ? "Change Plan"
                      : "Continue to Payment"}
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Additional Info */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-center text-gray-500 mt-6 pt-6 border-t border-gray-200"
                >
                  All plans include basic features.{" "}
                  {currentPackage
                    ? "Pro-rated charges may apply for plan changes."
                    : "Upgrade anytime. No hidden fees."}
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;
