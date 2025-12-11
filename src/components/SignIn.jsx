import React, { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useUserStore } from "@/zustand/useUserStore";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
  loading: { scale: 0.98 },
};

const eyeIconVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
};

// API endpoints
const API_ENDPOINTS = {
  signIn:
    "https://grozziieget.zjweiting.com:3091/CustomerService-Chat/api/dev/user/signIn2",
  userInfo:
    "https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/admin/admin-info",
};

export default function Signin() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, setDeviceMACs } = useUserStore();

  const navigate = useNavigate();

  const form = useForm({
    defaultValues: useMemo(
      () => ({
        userEmail: "",
        userPassword: "",
      }),
      []
    ),
  });

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const onSubmit = useCallback(
    async (values) => {
      setLoading(true);

      try {
        const trimmedEmail = values.userEmail.trim();
        const trimmedPassword = values.userPassword.trim();

        // Sign in request
        const signInResponse = await fetch(API_ENDPOINTS.signIn, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: trimmedEmail,
            userPassword: trimmedPassword,
          }),
        });

        const signInData = await signInResponse.json();

        if (!signInResponse.ok || signInData.error) {
          throw new Error(
            typeof signInData.error === "string"
              ? signInData.error
              : "Login failed"
          );
        }

        // Get user info
        const userInfoResponse = await fetch(
          `${API_ENDPOINTS.userInfo}?email=${trimmedEmail}`
        );
        const userInfo = await userInfoResponse.json();

        if (!userInfo?.id) {
          throw new Error("You are not authorized to access this page");
        }

        // Process device MACs
        const deviceMACs =
          userInfo.devices?.map((device) => ({
            deviceMAC: device.deviceMAC,
            deviceName: device.deviceName,
          })) || [];

        // Update Zustand store
        setUser(signInData.data);
        setDeviceMACs(deviceMACs);

        toast.success("Login successful");
        navigate("/Face_Attendance_Management_System", { replace: true });
      } catch (error) {
        toast.error(error.message || "Login failed");
        console.error("Login error:", error);
      } finally {
        setLoading(false);
      }
    },
    [navigate, setUser, setDeviceMACs]
  );

  return (
    <motion.div
      className="flex justify-center items-center  text-[#004368] "
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="space-y-6 p-10 rounded-2xl lg:w-[30vw] w-[90vw] max-w-md"
        variants={itemVariants}
      >
        {/* Header */}
        <motion.div
          className="font-[400] text-[24px] text-center space-y-2"
          variants={itemVariants}
        >
          <motion.p variants={itemVariants}>Let's get started</motion.p>
          <motion.p variants={itemVariants} className="font-bold">
            Log in to your account
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div className="pt-6" variants={itemVariants}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="userEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#004368] font-medium">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          className="text-black transition-all duration-200 focus:ring-2 focus:ring-[#004368]/20 focus:border-[#004368]"
                          style={{ boxShadow: "none" }}
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="userPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#004368] font-medium">
                        Password
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="text-black pr-10 transition-all duration-200 focus:ring-2 focus:ring-[#004368]/20 focus:border-[#004368]"
                            style={{ boxShadow: "none" }}
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <motion.div
                          className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-[#004368]"
                          onClick={togglePasswordVisibility}
                          variants={eyeIconVariants}
                          whileHover="hover"
                          whileTap="tap"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              togglePasswordVisibility();
                            }
                          }}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={showPassword ? "eye-off" : "eye"}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {showPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </motion.div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: "#004368", width: "100%" }}
                  className="relative overflow-hidden"
                  variants={buttonVariants}
                  initial="initial"
                  whileHover={loading ? "loading" : "hover"}
                  whileTap={loading ? "loading" : "tap"}
                  animate={loading ? "loading" : "initial"}
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Please wait...
                      </motion.div>
                    ) : (
                      <motion.span
                        key="login"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Log In
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Loading overlay */}
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-[#004368]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      style={{ originX: 0 }}
                    />
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
