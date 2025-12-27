import React, { useState, useEffect, useMemo } from "react";
import {
  Check,
  X,
  ChevronRight,
  Star,
  Shield,
  Globe,
  Calendar,
  Crown,
  AlertCircle,
  Plus,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  usePaymentInfo,
  useSubscriptionData,
} from "@/hook/useSubscriptionData";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/zustand/useUserStore";

const SubscriptionModal = () => {
  const currency = "USD";
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [buyMultiple, setBuyMultiple] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: packages = [] } = useSubscriptionData();
  const { isSubscriptionModal, setIsSubscriptionModal, setPackage } =
    useSubscriptionStore();
  const { data: paymentInfo } = usePaymentInfo();

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
      const currentPackageName = paymentInfo.package_name;
      const userPackage = packages.find(
        (pkg) => pkg.package_name === currentPackageName
      );

      if (userPackage) {
        setCurrentPackage({
          ...userPackage,
          paymentInfo: paymentInfo,
        });
        // Don't auto-select current package by default
        // setSelectedPackage(userPackage);
      }
    }
  }, [paymentInfo, packages]);

  // Filter out FreeTrial and memoize packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => pkg.package_name !== "FreeTrial");
  }, [packages]);

  // Handle package selection
  const handlePackageSelect = (pkg) => {
    if (currentPackage?.id === pkg.id) {
      // If selecting current package, enable multiple purchase
      setBuyMultiple(true);
    } else {
      setBuyMultiple(false);
      setQuantity(1);
    }
    setSelectedPackage(pkg);
  };

  // Handle quantity change
  // const handleQuantityChange = (value) => {
  //   if (value < 1) return;
  //   if (value > 10) {
  //     setQuantity(10);
  //     return;
  //   }
  //   setQuantity(value);
  // };

  // Handle purchase submission
  const handleSubmit = () => {
    if (!selectedPackage) return;

    if (user.emailVerified !== true) {
      navigate("/verification");
      setIsSubscriptionModal(false);
      setPackage(selectedPackage);
      return;
    }

    const encodedEmail = btoa(encodeURIComponent(user.userEmail));
    const url = `https://grozziieget.zjweiting.com:3090/attendance/payment/web/${selectedPackage.id}/${encodedEmail}/attendance`;

    // Add quantity parameter if buying multiple
    const finalUrl =
      buyMultiple && quantity > 1 ? `${url}?quantity=${quantity}` : url;

    window.location.href = finalUrl;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;
    const price = selectedPackage[currency] || 0;
    return price * quantity;
  };

  const isActiveSubscription = paymentInfo?.paymentStatus === 1;
  const expiryDays = isActiveSubscription
    ? getDaysUntilExpiry(paymentInfo.paymentExpireTime)
    : 0;

  if (!isSubscriptionModal) return null;

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
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto pointer-events-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex flex-col gap-4 p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isActiveSubscription
                        ? "Manage Subscription"
                        : "Choose Your Plan"}
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Select a plan or extend your current subscription
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSubscriptionModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Current Subscription Banner - Only show if active */}
                {isActiveSubscription && currentPackage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-[#004368]/5 to-[#004368]/10 border border-[#004368]/20 rounded-xl p-4"
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
                className="px-6 py-4"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Billing Currency:
                  </span>
                  <div className="flex gap-1 ml-2">
                    {["USD", "EUR", "SGD", "CNY"].map((curr) => (
                      <button
                        key={curr}
                        className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                          currency === curr
                            ? "bg-[#004368] text-white shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Pricing Cards Grid */}
              <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredPackages.map((pkg, index) => {
                    const price = pkg[currency];
                    const isSelected = selectedPackage?.id === pkg.id;
                    const isCurrent = currentPackage?.id === pkg.id;
                    const isPopular = pkg.package_name === "Premium";

                    return (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className={`relative border rounded-xl transition-all duration-200 cursor-pointer ${
                          isCurrent
                            ? "border-[#004368] bg-[#004368]/5"
                            : "border-gray-200 hover:border-[#004368]/50 hover:shadow-md"
                        } ${
                          isSelected
                            ? "border-[#004368] shadow-lg shadow-[#004368]/20"
                            : ""
                        } ${isPopular ? "ring-2 ring-[#004368]/30" : ""}`}
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        {/* Current Plan Badge */}
                        {isCurrent && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-5">
                            <div className="px-3 py-1 bg-[#004368] text-white text-xs font-bold rounded-full shadow-md">
                              CURRENT
                            </div>
                          </div>
                        )}

                        {/* Popular Badge */}
                        {isPopular && !isCurrent && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="px-3 py-1 bg-gradient-to-r from-[#004368] to-[#003152] text-white text-xs font-bold rounded-full shadow-md">
                              POPULAR
                            </div>
                          </div>
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
                                {pkg.duration_months === 1 ? "Month" : "Months"}
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
                                  / month
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
                            {/* <div className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                Up to 100 employees
                              </span>
                            </div> */}

                            {/* Package-specific Features */}
                            {pkg.features
                              .filter(
                                (feature) =>
                                  !feature.includes("https://printernoble.com")
                              )
                              .map((feature, idx) => (
                                <div key={idx} className="flex items-start">
                                  <Check className="w-4 h-4 text-[#004368] mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-600 leading-tight">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                          </div>

                          {/* Select/Current Button */}
                          <button
                            className={`w-full py-3 rounded-lg text-sm font-medium transition-all mt-auto ${
                              isCurrent
                                ? "bg-[#004368] text-white shadow-md"
                                : isSelected
                                ? "bg-[#004368] text-white shadow-md"
                                : "bg-[#004368]/10 text-[#004368] hover:bg-[#004368]/20"
                            }`}
                          >
                            {isCurrent ? (
                              <div className="flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" />
                                Current Plan
                              </div>
                            ) : isSelected ? (
                              <div className="flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" />
                                Selected
                              </div>
                            ) : (
                              "Select Plan"
                            )}
                          </button>
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
                className="p-6 border-t border-gray-100"
              >
                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-6 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Secure payment
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                    <Star className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-gray-600">24/7 support</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  {/* Selected Package Summary */}
                  {selectedPackage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="w-full max-w-md"
                    >
                      <div className="p-4 bg-gradient-to-r from-[#004368]/5 to-[#004368]/10 rounded-lg border border-[#004368]/20">
                        <div className="flex flex-col gap-4">
                          {/* Multiple Purchase Option - Only show for current package */}
                          {/* {currentPackage?.id === selectedPackage.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 bg-white rounded-lg border border-blue-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Purchase Additional Licenses
                                  </span>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={buyMultiple}
                                    onChange={(e) => {
                                      setBuyMultiple(e.target.checked);
                                      if (!e.target.checked) setQuantity(1);
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-xs text-gray-600">
                                    Buy multiple
                                  </span>
                                </label>
                              </div>

                              {buyMultiple && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-600">
                                      Quantity:
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(quantity - 1)
                                        }
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                                        disabled={quantity <= 1}
                                      >
                                        <span className="text-gray-600">-</span>
                                      </button>
                                      <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={quantity}
                                        onChange={(e) =>
                                          handleQuantityChange(
                                            parseInt(e.target.value) || 1
                                          )
                                        }
                                        className="w-16 text-center border border-gray-300 rounded-lg py-1"
                                      />
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(quantity + 1)
                                        }
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                                        disabled={quantity >= 10}
                                      >
                                        <Plus className="w-4 h-4 text-gray-600" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Extend your current plan with additional
                                    licenses
                                  </p>
                                </motion.div>
                              )}
                            </motion.div>
                          )} */}

                          {/* Plan Summary */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                {currentPackage?.id === selectedPackage.id
                                  ? "Extending Current Plan"
                                  : "Selected Plan"}
                              </p>
                              <p className="text-lg font-bold text-gray-900">
                                {selectedPackage.package_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {buyMultiple && quantity > 1 ? (
                                  <>
                                    {quantity} × {currencySymbols[currency]}
                                    {selectedPackage[currency]} ={" "}
                                    <span className="font-bold text-[#004368]">
                                      {currencySymbols[currency]}
                                      {calculateTotalPrice().toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    Total:{" "}
                                    <span className="font-bold text-[#004368]">
                                      {currencySymbols[currency]}
                                      {selectedPackage[currency]}
                                    </span>
                                  </>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                for {selectedPackage.duration_months} months
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Continue Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!selectedPackage}
                    className={`px-8 py-3 text-sm font-semibold rounded-lg flex items-center gap-2 shadow-md transition-all ${
                      selectedPackage
                        ? "bg-gradient-to-r from-[#004368] to-[#003152] text-white hover:shadow-lg"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {currentPackage?.id === selectedPackage?.id && buyMultiple
                      ? "Extend Current Plan"
                      : "Continue to Payment"}
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Additional Info */}
                <p className="text-xs text-center text-gray-500 mt-6 pt-6 border-t border-gray-200">
                  {buyMultiple
                    ? "Additional licenses will extend your subscription duration."
                    : "All plans include basic features. Upgrade anytime. No hidden fees."}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;
