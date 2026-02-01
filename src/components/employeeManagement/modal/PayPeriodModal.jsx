import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import NormalMonthForm from "./payPeriod/NormalMonthForm";
import { X } from "lucide-react";
import MonthlyForm from "./payPeriod/MonthlyForm";
import SemiMonthlyForm from "./payPeriod/SemiMonthlyForm";
import BiWeeklyForm from "./payPeriod/BiWeeklyForm";
import WeeklyForm from "./payPeriod/WeeklyForm";
import FlexibleWorkForm from "./payPeriod/FlexibleWorkForm";

const PayPeriodModal = ({ isOpen, onCancel }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("normalMonthly");

  const payPeriods = [
    { value: "normalMonthly", label: "Normal Month" },
    { value: "monthly", label: "Monthly" },
    { value: "semiMonthly", label: "Semi Monthly" },
    { value: "biWeekly", label: "Bi Weekly" },
    { value: "weekly", label: "Weekly" },
    { value: "hourly", label: "Flexible Work Schedule" },
  ];

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case "normalMonthly":
        return "Normal Monthly";
      case "monthly":
        return "Monthly";
      case "semiMonthly":
        return "Semi Monthly";
      case "biWeekly":
        return "Bi Weekly";
      case "weekly":
        return "Weekly";
      default:
        return "Flexible Work Schedule";
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-[65vw] h-[85vh] flex flex-col relative "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 absolute top-2 right-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Content */}
              <div className="flex flex-1 min-h-0 p-6">
                {/* Left Section: Pay Period List */}
                <Card className="w-1/3 h-full">
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
                          <Label
                            htmlFor={item.value}
                            className={
                              selectedPeriod === item.value
                                ? "text-black"
                                : "text-gray-500"
                            }
                          >
                            {item.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Right Section: Pay Period Details */}
                <Card className="w-2/3 h-full ml-6">
                  <CardHeader>
                    <CardTitle>{getPeriodTitle()}</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)] overflow-y-auto p-0 custom-scrollbar ">
                    {selectedPeriod === "normalMonthly" && <NormalMonthForm />}
                    {selectedPeriod === "monthly" && <MonthlyForm />}
                    {selectedPeriod === "semiMonthly" && <SemiMonthlyForm />}
                    {selectedPeriod === "biWeekly" && <BiWeeklyForm />}
                    {selectedPeriod === "weekly" && <WeeklyForm />}
                    {selectedPeriod === "hourly" && <FlexibleWorkForm />}
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

export default PayPeriodModal;
