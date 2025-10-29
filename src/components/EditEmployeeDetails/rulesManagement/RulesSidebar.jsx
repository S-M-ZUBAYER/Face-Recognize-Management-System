import { Checkbox } from "@/components/ui/checkbox";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

const RulesSidebar = ({ rules, selectedRule, onRuleSelect }) => {
  const { selectedEmployee } = useEmployeeStore();

  // ✅ Safely extract all rule IDs as numbers from employee data
  const getAllRuleIds = (rulesArray) => {
    if (!Array.isArray(rulesArray)) return [];
    return rulesArray.map((rule) => Number(rule.ruleId)); // normalize to number
  };

  // ✅ Get array of rule IDs from employee's existing salary rules
  const existingRuleIds = getAllRuleIds(selectedEmployee?.salaryRules?.rules);

  // ✅ Utility: check if a specific rule ID exists in that list
  const hasRuleId = (ruleIdsArray, id) => {
    if (!Array.isArray(ruleIdsArray)) return false;
    return ruleIdsArray.includes(Number(id)); // type-safe match
  };

  return (
    <div className="w-[30%] bg-white border rounded-md border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-6">Salary Rules</h1>
        <div className="overflow-y-auto h-[70vh] custom-scrollbar">
          {Array.isArray(rules) && rules.length > 0 ? (
            rules.map((rule) => {
              const isChecked =
                hasRuleId(existingRuleIds, rule.id) ||
                selectedRule?.id === rule.id;

              return (
                <label
                  key={rule.id}
                  className={`flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRule?.id === rule.id
                      ? "font-semibold text-gray-900"
                      : "text-[#9D9D9D] hover:text-gray-700"
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onRuleSelect(rule)}
                    className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
                  />
                  <span className="text-sm text-gray-700">
                    {rule.id + 1}. {rule.title}
                  </span>
                </label>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 py-4">No rules available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RulesSidebar;
