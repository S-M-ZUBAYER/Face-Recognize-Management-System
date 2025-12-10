import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Clock,
  ArrowRight,
  Key,
  Edit2,
  User,
  Send,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useUserData } from "@/hook/useUserData";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";
import { useNavigate } from "react-router-dom";

const EmailVerification = ({
  maxResendAttempts = 3,
  codeExpirySeconds = 300,
}) => {
  const { user } = useUserData();
  const navigate = useNavigate();

  // States
  const [step, setStep] = useState("email"); // 'email' or 'verify'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alternativeEmail, setAlternativeEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [timeLeft, setTimeLeft] = useState(codeExpirySeconds);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [resendCount, setResendCount] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [isAlternateEmail, setIsAlternateEmail] = useState(false);
  const { package: pack } = useSubscriptionStore();
  // console.log(pack);

  // Initialize email from user data
  useEffect(() => {
    if (user?.userEmail) {
      setEmail(user.userEmail);
    }
  }, [user?.userEmail]);

  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Handle alternative email change
  const handleAlternativeEmailChange = (e) => {
    setAlternativeEmail(e.target.value);
  };

  // Validate email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Send verification code
  const handleSendCode = async () => {
    // Validate inputs
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      if (isAlternateEmail && alternativeEmail) {
        // Send verification code to alternative email
        if (!isValidEmail(alternativeEmail)) {
          toast.error("Please enter a valid alternative email address");
          setIsLoading(false);
          return;
        }

        await axios.post(
          `https://grozziieget.zjweiting.com:3091/CustomerService-Chat/api/v1/user/alternate-email/add?email=${email}&password=${password}&alternateEmail=${alternativeEmail}`
          // {
          //   email: email,
          //   password: password,
          //   alternateEmail: alternativeEmail,
          // }
        );

        // Use alternative email for verification
        setEmail(alternativeEmail);
      } else {
        // Send verification code to primary email
        await axios.post(
          `https://grozziieget.zjweiting.com:3091/CustomerService-Chat/api/v1/user/resend-verification?email=${email}&password=${password}`
          // {
          //   email: email,
          //   password: password,
          // }
        );
      }

      setEmailSent(true);
      setStep("verify");
      setTimeLeft(codeExpirySeconds);
      setResendCount(0);
      setVerificationStatus("pending");

      toast.success(
        `Verification code sent to ${
          isAlternateEmail ? alternativeEmail : email
        }`
      );
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to send verification code. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input change
  const handleInputChange = (index, value) => {
    // Allow alphanumeric (letters and numbers)
    if (value.length <= 1 && /^[A-Za-z0-9]*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value.toUpperCase(); // Convert to uppercase
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    // Allow alphanumeric
    if (/^[A-Za-z0-9]+$/.test(pastedData)) {
      const newCode = pastedData.toUpperCase().split(""); // Convert to uppercase
      while (newCode.length < 6) newCode.push("");
      setVerificationCode(newCode.slice(0, 6));

      // Focus last input
      setTimeout(() => {
        const lastInput = document.getElementById(
          `code-${Math.min(pastedData.length, 5)}`
        );
        lastInput?.focus();
      }, 0);
    }
  };

  // Handle key down (backspace navigation)
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle verification
  const handleVerify = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      await axios.get(
        `https://grozziieget.zjweiting.com:3091/CustomerService-Chat/api/v1/user/verify?code=${code}`
      );

      setVerificationStatus("success");
      toast.success("Email verified successfully!");

      // Optional: Redirect or close modal after successful verification
      setTimeout(() => {
        // router.push('/dashboard');
        // or close modal if this is a modal
      }, 2000);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("failed");
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Invalid verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend
  const handleResend = async () => {
    if (resendCount >= maxResendAttempts) {
      toast.error(`Maximum resend attempts (${maxResendAttempts}) reached`);
      return;
    }

    if (!password) {
      toast.error("Password is required to resend verification code");
      return;
    }

    setIsLoading(true);
    try {
      if (isAlternateEmail && alternativeEmail) {
        await axios.post(
          `https://grozziieget.zjweiting.com:3091/CustomerService-Chat/api/v1/user/alternate-email/add?email=${email}&password=${password}&alternateEmail=${alternativeEmail}`
          // {
          //   email: email,
          //   password: password,
          //   alternateEmail: alternativeEmail,
          // }
        );
      } else {
        await axios.post(
          `https://grozziieget.zjweiting.com:3091/CustomerService-Chat/api/v1/user/resend-verification?email=${email}&password=${password}`
          // {
          //   email: email,
          //   password: password,
          // }
        );
      }

      setResendCount((prev) => prev + 1);
      setTimeLeft(codeExpirySeconds);
      setVerificationCode(["", "", "", "", "", ""]);
      setVerificationStatus("pending");

      // Focus first input
      setTimeout(() => {
        document.getElementById("code-0")?.focus();
      }, 100);

      toast.success("Verification code sent again!");
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to resend code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (step !== "verify" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle alternate email option
  const toggleAlternateEmail = () => {
    setIsAlternateEmail(!isAlternateEmail);
    if (!isAlternateEmail) {
      setAlternativeEmail("");
    }
  };

  // Status card content
  const getStatusContent = () => {
    switch (verificationStatus) {
      case "success":
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          title: "Email Verified!",
          description: "Your email has been successfully verified.",
          color: "green",
        };
      case "failed":
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          title: "Verification Failed",
          description: "The code you entered is invalid or expired.",
          color: "red",
        };
      default:
        return {
          icon: <Shield className="w-12 h-12 text-blue-500" />,
          title: "Verify Your Email",
          description: "Enter the 6-digit code sent to your email.",
          color: "blue",
        };
    }
  };

  const statusContent = getStatusContent();

  const handleContinue = () => {
    if (pack === null) {
      navigate("/");
      return;
    } else {
      const encodedEmail = btoa(encodeURIComponent(user.userEmail));
      const url = `https://grozziieget.zjweiting.com:3090/attendance/payment/web/${pack.id}/${encodedEmail}/attendance`;

      window.location.href = url;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#004368] to-[#0066a1] p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {step === "email"
                ? "Email Verification"
                : "Enter Verification Code"}
            </h1>
            <p className="text-blue-100">
              {step === "email"
                ? "Verify your email address"
                : "Enter the code sent to your email"}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: Email & Password Input */}
              {step === "email" && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={!isEditingEmail && emailSent}
                        className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          !isEditingEmail && emailSent
                            ? "bg-gray-100 border-gray-300 text-gray-700"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {emailSent && (
                        <button
                          onClick={() => setIsEditingEmail(!isEditingEmail)}
                          className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          {isEditingEmail ? "Save" : "Edit"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Alternate Email Option */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAlternateEmail}
                          onChange={toggleAlternateEmail}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Send verification to different email
                        </span>
                      </label>
                    </div>

                    {isAlternateEmail && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alternative Email
                        </label>
                        <input
                          type="email"
                          value={alternativeEmail}
                          onChange={handleAlternativeEmailChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="alternative.email@example.com"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Verification code will be sent to this email instead
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Security Info */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          Security Notice
                        </p>
                        <p className="text-sm text-gray-600">
                          We need your password to verify your identity before
                          sending the verification code. Your password is
                          encrypted and never stored.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Send Code Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendCode}
                    disabled={
                      isLoading ||
                      !isValidEmail(email) ||
                      !password ||
                      (isAlternateEmail && !isValidEmail(alternativeEmail))
                    }
                    className="w-full py-3 bg-gradient-to-r from-[#004368] to-[#0066a1] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* STEP 2: OTP Verification */}
              {step === "verify" && (
                <motion.div
                  key="verify-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Email Display */}
                  <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Verification code sent to
                          </p>
                          <p className="font-semibold text-gray-900">{email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setStep("email");
                          setIsEditingEmail(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={verificationStatus}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`mb-8 p-6 rounded-xl border ${
                        verificationStatus === "success"
                          ? "border-green-200 bg-green-50"
                          : verificationStatus === "failed"
                          ? "border-red-200 bg-red-50"
                          : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        {statusContent.icon}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {statusContent.title}
                          </h3>
                          <p className="text-gray-600">
                            {statusContent.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Code Input - Only show when pending */}
                  {verificationStatus === "pending" && (
                    <>
                      <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                          Enter 6-digit verification code
                        </label>
                        <div className="flex justify-center gap-3 mb-4">
                          {verificationCode.map((digit, index) => (
                            <input
                              key={index}
                              id={`code-${index}`}
                              type="text"
                              inputMode="text" // Changed from "numeric" to "text"
                              pattern="[A-Za-z0-9]*" // Changed to alphanumeric pattern
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleInputChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              onPaste={handlePaste}
                              disabled={isLoading}
                              className="w-14 h-14 text-center text-2xl font-bold bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              autoFocus={index === 0}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Code expires in:{" "}
                            <span className="text-red-600">
                              {formatTime(timeLeft)}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Timer Warning */}
                      {timeLeft < 60 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3"
                        >
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <p className="text-sm text-amber-800">
                            Code expires soon!{" "}
                            {timeLeft < 30 && "Request a new code if needed."}
                          </p>
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions - For Verification Step */}
            {step === "verify" && (
              <div className="space-y-4">
                {verificationStatus === "pending" && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleVerify}
                      disabled={
                        isLoading || verificationCode.join("").length !== 6
                      }
                      className="w-full py-3 bg-gradient-to-r from-[#004368] to-[#0066a1] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify Email
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Didn't receive the code?
                      </div>
                      <button
                        onClick={handleResend}
                        disabled={
                          isLoading ||
                          timeLeft > 0 ||
                          resendCount >= maxResendAttempts
                        }
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {resendCount === 0
                          ? "Resend Code"
                          : `Resend (${resendCount}/${maxResendAttempts})`}
                      </button>
                    </div>
                  </>
                )}

                {/* Success/Failure Actions */}
                {verificationStatus !== "pending" && (
                  <div className="space-y-3">
                    {verificationStatus === "success" ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContinue()}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200"
                      >
                        Continue
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleResend}
                        disabled={resendCount >= maxResendAttempts}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Try Again
                      </motion.button>
                    )}

                    <button
                      onClick={() => {
                        setVerificationStatus("pending");
                        setVerificationCode(["", "", "", "", "", ""]);
                      }}
                      className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      Enter Different Code
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          {step === "verify" ? (
            <button
              onClick={() => setStep("email")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              ← Back to email entry
            </button>
          ) : (
            <button
              onClick={() => window.history.back()}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              ← Back to previous page
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
