import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import NormalMonthForm from "@/components/payPeriod/NormalMonthForm";
import MonthlyForm from "@/components/payPeriod/MonthlyForm";
import SemiMonthlyForm from "@/components/payPeriod/SemiMonthlyForm";
import BiWeeklyForm from "@/components/payPeriod/BiWeeklyForm";
import WeeklyForm from "@/components/payPeriod/WeeklyForm";
import FlexibleWorkForm from "@/components/payPeriod/FlexibleWorkForm";

const PayPeriodPage = () => {
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
      {/* Main Content */}
      <div className="bg-white rounded-lg w-[80vw] h-[85vh] flex flex-col relative ">
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
                  <div key={item.value} className="flex items-center space-x-2">
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
      </div>
    </>
  );
};

export default PayPeriodPage;
