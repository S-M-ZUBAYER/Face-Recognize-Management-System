import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import NormalMonthForm from "./NormalMonthForm";
import { X } from "lucide-react";

const PayPeriodSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("normal-month");

  const payPeriods = [
    { value: "normal-month", label: "Normal Month" },
    { value: "monthly", label: "Monthly" },
    { value: "semi-monthly", label: "Semi-Monthly" },
    { value: "bi-weekly", label: "Bi-Weekly" },
    { value: "weekly", label: "Weekly" },
    { value: "flexible", label: "Flexible Work Schedule" },
  ];

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case "normal-month":
        return "Normal Monthly";
      case "monthly":
        return "Monthly";
      case "semi-monthly":
        return "Semi-Monthly";
      case "bi-weekly":
        return "Bi-Weekly";
      case "weekly":
        return "Weekly";
      default:
        return "Flexible Work Schedule";
    }
  };

  return (
    <>
      <div className="mb-4 cursor-pointer" onClick={() => setIsOpen(true)}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pay Period
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between">
          <p className="text-gray-600">PayPeriod</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <path
              d="M6.75004 4.5C6.75004 4.5 11.25 7.81417 11.25 9C11.25 10.1859 6.75 13.5 6.75 13.5"
              stroke="#004368"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-[65vw] max-h-[90vh] overflow-y-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* === Cancel Button === */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-between items-start p-2 ">
                {/* === Left Section: Pay Period List === */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Pay Period</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={selectedPeriod}
                      onValueChange={setSelectedPeriod}
                      className="flex flex-col space-y-3"
                    >
                      {payPeriods.map((item) => (
                        <div
                          key={item.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem value={item.value} id={item.value} />
                          <Label htmlFor={item.value}>{item.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* === Right Section: Pay Period Details === */}
                <Card className="w-[49vw]">
                  <CardHeader>
                    <CardTitle>{getPeriodTitle()}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedPeriod === "normal-month" && <NormalMonthForm />}
                    {selectedPeriod === "monthly" && <MonthlyForm />}
                    {selectedPeriod === "semi-monthly" && <SemiMonthlyForm />}
                    {selectedPeriod === "bi-weekly" && <BiWeeklyForm />}
                    {selectedPeriod === "weekly" && <WeeklyForm />}
                    {selectedPeriod === "flexible" && <FlexibleWorkForm />}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PayPeriodSettings;

// === Placeholder forms for future types ===
const MonthlyForm = () => <p>Monthly Form (coming soon...)</p>;
const SemiMonthlyForm = () => <p>Semi-Monthly Form (coming soon...)</p>;
const BiWeeklyForm = () => <p>Bi-Weekly Form (coming soon...)</p>;
const WeeklyForm = () => <p>Weekly Form (coming soon...)</p>;
const FlexibleWorkForm = () => (
  <p>Flexible Work Schedule Form (coming soon...)</p>
);
