import { Checkbox } from "@/components/ui/checkbox";
import useAlertDialog from "@/zustand/useAlertDialog";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

const RulesSidebar = ({ rules, selectedRule, onRuleSelect }) => {
  const { selectedEmployee } = useEmployeeStore();
  const { openDialog } = useAlertDialog();

  const getAllRuleIds = (rulesArray) => {
    if (!Array.isArray(rulesArray)) return [];
    return rulesArray.map((rule) => Number(rule.ruleId));
  };

  const existingRuleIds = getAllRuleIds(selectedEmployee?.salaryRules?.rules);

  const hasRuleId = (ruleIdsArray, id) => {
    if (!Array.isArray(ruleIdsArray)) return false;
    return ruleIdsArray.includes(Number(id));
  };

  // Check if rule ID is in dependency group (6-9)
  const isDependencyRule = (ruleId) => {
    return [6, 7, 8, 9].includes(ruleId);
  };

  // Check if rule ID is in exclusive group (18-23)
  const isExclusiveRule = (ruleId) => {
    return ruleId > 16 && ruleId < 23;
  };

  // Get selected exclusive rules (18-23)
  const getSelectedExclusiveRules = () => {
    return existingRuleIds.filter((id) => isExclusiveRule(id));
  };

  const handleRuleSelect = (rule) => {
    // Condition 0: Rule 1 is mandatory for all other rules
    if (rule.id !== 0 && !hasRuleId(existingRuleIds, 0)) {
      openDialog(
        `Rule 1 is mandatory. Please select Rule 1 first before selecting any other rule.`
      );
      return;
    }

    // Condition 1: Rules 6-9 require rule 24 to be set
    if (isDependencyRule(rule.id)) {
      if (!hasRuleId(existingRuleIds, 24)) {
        openDialog(
          `Rule ${
            rule.id + 1
          } requires Rule 24 to be selected first. Please add Rule 24 before selecting this rule.`
        );
        return;
      }
    }

    // Condition 2: Rules 18-23 are mutually exclusive
    if (isExclusiveRule(rule.id)) {
      const selectedExclusive = getSelectedExclusiveRules();
      if (
        selectedExclusive.length > 0 &&
        !hasRuleId(selectedExclusive, rule.id)
      ) {
        openDialog(
          `You can only select one rule from the group (18-22). You already have Rule ${
            selectedExclusive[0]
          } selected. Please deselect it first if you want to select Rule ${
            rule.id + 1
          }.`
        );
        return;
      }
    }

    // If all validations pass, select the rule
    onRuleSelect(rule);
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
                    onCheckedChange={() => handleRuleSelect(rule)}
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
