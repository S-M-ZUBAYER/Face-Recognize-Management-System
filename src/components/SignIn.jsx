import React, { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Signin() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      userEmail: "",
      userPassword: "",
    },
  });

  async function onSubmit(values) {
    setLoading(true);
    try {
      const res = await fetch(
        "https://grozziieget.zjweiting.com:3091/CustomerService-Chat/api/dev/user/signIn2",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const data = await res.json();

      if (res.ok && !data.error) {
        const response = await fetch(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance/admin/admin-info?email=${values.userEmail}`
        );
        const userInfo = await response.json();

        if (userInfo?.id) {
          const deviceMACs = userInfo.devices.map((device) => ({
            deviceMAC: device.deviceMAC,
            deviceName: device.deviceName,
          }));

          localStorage.setItem("user", JSON.stringify(data.data));
          localStorage.setItem("deviceMACs", JSON.stringify(deviceMACs));
          toast.success("Login successful");
          navigate("/", { replace: true });
        } else {
          toast.error("You are not authorized to access this page");
        }
      } else {
        throw new Error(
          typeof data.error === "string" ? data.error : "Login failed"
        );
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=" flex justify-center items-center  text-[#004368] ">
      <div className=" space-x-5 p-10 rounded-2xl lg:w-[30vw] w-[90vw]">
        <div className="font-[400] text-[24px]">
          <p>Let’s get started</p>
          <p>
            <strong>log in</strong> to your account
          </p>
        </div>
        <div className="pt-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        className="text-black"
                        style={{
                          boxShadow: "none",
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="text-black pr-10"
                          style={{
                            boxShadow: "none",
                          }}
                          {...field}
                        />
                      </FormControl>
                      <div
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#004368", width: "100%" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Please wait...
                  </>
                ) : (
                  "Log-In"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
