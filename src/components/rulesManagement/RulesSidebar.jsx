import { Checkbox } from "../ui/checkbox";

const RulesSidebar = ({ rules, selectedRule, onRuleSelect }) => {
  return (
    <div className="w-[25%] bg-white border rounded-md border-gray-200 ">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-6">Salary Rules</h1>
        <div className=" overflow-y-auto h-[70vh] custom-scrollbar ">
          {rules.map((rule) => (
            <label
              key={rule.id}
              className={`flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-colors ${
                selectedRule?.id === rule.id
                  ? "font-semibold"
                  : "text-[#9D9D9D] "
              }`}
            >
              <Checkbox
                checked={selectedRule?.id === rule.id}
                onCheckedChange={() => onRuleSelect(rule)}
                className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
              />
              <span className="text-sm text-gray-700">
                {rule.id}. {rule.title}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RulesSidebar;
