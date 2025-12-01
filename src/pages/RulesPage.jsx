import { useState } from "react";
import RulesSidebar from "@/components/rulesManagement/RulesSidebar";
import { RuleContent } from "@/components/rulesManagement/RuleContent";
import AlertDialog from "@/components/AlertDialog";

const RulesPage = () => {
  const [selectedRule, setSelectedRule] = useState(null);

  const rules = [
    { id: 0, title: "Select work shift time", component: "workShift" },
    { id: 1, title: "Select holiday", component: "holiday" },
    { id: 2, title: "Select weekend", component: "weekend" },
    {
      id: 3,
      title: "Work on holidays instead of other day",
      component: "workOnHoliday",
    },
    { id: 4, title: "Lateness warning system", component: "lateness" },
    { id: 5, title: "Flexible work settings", component: "flexible" },
    {
      id: 6,
      title: "Use overtime to offset being late",
      component: "overtimeOffset",
    },
    { id: 7, title: "Overtime does not count", component: "overtimeCount" },
    { id: 8, title: "Weekend overtime", component: "weekendOvertime" },
    { id: 9, title: "Holiday overtime", component: "holidayOvertime" },
    { id: 10, title: "Ask for leave", component: "leave" },
    { id: 11, title: "Special time documents", component: "specialTime" },
    { id: 12, title: "Replacement day", component: "replacement" },
    { id: 13, title: "Absence from work penalty", component: "absence" },
    {
      id: 14,
      title: "Piece-rate pay with leave impact",
      component: "pieceRate",
    },
    { id: 15, title: "Late arrival penalty-1", component: "lateArrival" },
    { id: 16, title: "Early departure deduction", component: "earlyDeparture" },
    { id: 17, title: "Late arrival Penalty-2", component: "lateArrival2" },
    { id: 18, title: "Late arrival Penalty-3", component: "lateArrival3" },
    { id: 19, title: "Late arrival fine-4", component: "lateArrival4" },
    { id: 20, title: "Late arrival fine-5", component: "lateArrival5" },
    { id: 21, title: "Late arrival Penalty-6", component: "lateArrival6" },
    { id: 22, title: "Missed Punch", component: "missedPunch" },
    { id: 23, title: "Select Overtime", component: "selectOvertime" },
    { id: 24, title: "Set Total Leave Days", component: "setTotalLeaveDays" },
  ];

  const handleRuleSelect = (rule) => {
    setSelectedRule(rule);
  };

  const handleBack = () => {
    setSelectedRule(null);
  };

  return (
    <div className="flex gap-3">
      <RulesSidebar
        rules={rules}
        selectedRule={selectedRule}
        onRuleSelect={handleRuleSelect}
      />
      <RuleContent selectedRule={selectedRule} onBack={handleBack} />
      <AlertDialog />
    </div>
  );
};

export default RulesPage;
