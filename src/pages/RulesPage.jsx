import { useState } from "react";
import RulesSidebar from "@/components/rulesManagement/RulesSidebar";
import { RuleContent } from "@/components/rulesManagement/RuleContent";

const RulesPage = () => {
  const [selectedRule, setSelectedRule] = useState(null);

  const rules = [
    { id: 1, title: "Select work shift time", component: "workShift" },
    { id: 2, title: "Select holiday", component: "holiday" },
    { id: 3, title: "Select weekend", component: "weekend" },
    {
      id: 4,
      title: "Work on holidays instead of other day",
      component: "workOnHoliday",
    },
    { id: 5, title: "Lateness warning system", component: "lateness" },
    { id: 6, title: "Flexible work settings", component: "flexible" },
    {
      id: 7,
      title: "Use overtime to offset being late",
      component: "overtimeOffset",
    },
    { id: 8, title: "Overtime does not count", component: "overtimeCount" },
    { id: 9, title: "Weekend overtime", component: "weekendOvertime" },
    { id: 10, title: "Holiday overtime", component: "holidayOvertime" },
    { id: 11, title: "Ask for leave", component: "leave" },
    { id: 12, title: "Special time documents", component: "specialTime" },
    { id: 13, title: "Replacement day", component: "replacement" },
    { id: 14, title: "Absence from work penalty", component: "absence" },
    {
      id: 15,
      title: "Piece-rate pay with leave impact",
      component: "pieceRate",
    },
    { id: 16, title: "Late arrival penalty-1", component: "lateArrival" },
    { id: 17, title: "Early departure deduction", component: "earlyDeparture" },
    { id: 18, title: "Late arrival Penalty-2", component: "lateArrival2" },
    { id: 19, title: "Late arrival Penalty-3", component: "lateArrival3" },
    { id: 20, title: "Late arrival fine-4", component: "lateArrival4" },
    { id: 21, title: "Late arrival fine-5", component: "lateArrival5" },
    { id: 22, title: "Late arrival Penalty-6", component: "lateArrival6" },
    { id: 23, title: "Missed Punch", component: "missedPunch" },
    { id: 24, title: "Select Overtime", component: "selectOvertime" },
    { id: 25, title: "Set Total Leave Days", component: "setTotalLeaveDays" },
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
    </div>
  );
};

export default RulesPage;
