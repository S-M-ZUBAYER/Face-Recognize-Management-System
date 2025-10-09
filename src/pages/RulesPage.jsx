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
    { id: 16, title: "Late arrival penalty", component: "lateArrival" },
    { id: 17, title: "Early departure deduction", component: "earlyDeparture" },
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
