import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function NormalMonthForm() {
  const [basic, setBasic] = useState("");
  const [other, setOther] = useState("");
  const [additionalSalaries, setAdditionalSalaries] = useState([]);

  const salarySections = [
    {
      id: "basic-salary",
      label: "Basic Salary",
      value: basic,
      setValue: setBasic,
      placeholder: "000000",
    },
    {
      id: "other-salary",
      label: "Others Salary",
      value: other,
      setValue: setOther,
      placeholder: "000000",
    },
  ];

  const addSalarySection = () => {
    setAdditionalSalaries([
      ...additionalSalaries,
      {
        id: Date.now(),
        type: "",
        amount: "",
      },
    ]);
  };

  const removeSalarySection = (id) => {
    setAdditionalSalaries(
      additionalSalaries.filter((salary) => salary.id !== id)
    );
  };

  const updateSalarySection = (id, field, value) => {
    setAdditionalSalaries(
      additionalSalaries.map((salary) =>
        salary.id === id ? { ...salary, [field]: value } : salary
      )
    );
  };

  const checkboxStyle =
    "data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white";

  return (
    <div className="space-y-5 p-6 w-full">
      {/* === Salary Section === */}
      <div className="space-y-2">
        {salarySections.map(({ id, label, value, setValue, placeholder }) => (
          <div key={id} className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <Checkbox id={id} className={checkboxStyle} />
              <Label htmlFor={id}>{label}</Label>
            </div>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-80"
              placeholder={placeholder}
              type={"number"}
            />
          </div>
        ))}

        {/* Additional Salary Sections */}
        {additionalSalaries.map((salary) => (
          <div key={salary.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <Checkbox className={checkboxStyle} />
              <div className="flex gap-2">
                <Input
                  value={salary.type}
                  onChange={(e) =>
                    updateSalarySection(salary.id, "type", e.target.value)
                  }
                  className="w-40"
                  placeholder="Salary Type"
                />
                <Input
                  value={salary.amount}
                  onChange={(e) =>
                    updateSalarySection(salary.id, "amount", e.target.value)
                  }
                  className="w-40"
                  placeholder="Amount"
                  type={"number"}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSalarySection(salary.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="mt-2 flex items-center bg-[#E6ECF0]"
            style={{ padding: "16px 52px" }}
            onClick={addSalarySection}
          >
            <Plus className="w-4 h-4 text-[#004368]" />
            <span>Add another salary section</span>
          </Button>
        </div>
      </div>

      {/* === Working Day === */}
      <div className="flex justify-between">
        <Label className="font-semibold whitespace-nowrap">
          Add Working Day
        </Label>
        <Input placeholder="26 Days" className="w-80" type={"number"} />
      </div>

      {/* === Working Hours === */}
      <div className="flex justify-between">
        <Label className="font-semibold whitespace-nowrap">
          Add Working Hours
        </Label>
        <Input placeholder="8" className="w-80" type={"number"} />
      </div>

      {/* === Overtime Rate === */}
      <div className="space-y-3">
        <Label className="font-semibold">Select Overtime Rate</Label>
        <div className="flex flex-col space-y-2">
          {[
            {
              id: "auto-calc",
              label: "Automatic Calculation (Day)",
              placeholder: "000",
            },
            {
              id: "fixed-input",
              label: "Fixed Input (Hour)",
              placeholder: "Enter Overtime Rate",
            },
          ].map(({ id, label, placeholder }) => (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <Checkbox id={id} className={checkboxStyle} />
                <Label htmlFor={id} className="whitespace-nowrap">
                  {label}
                </Label>
              </div>
              <Input
                placeholder={placeholder}
                className="w-80"
                type={"number"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* === Details Section === */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              if you select the automatic calculation option,the system will
              calculate the base hourly wage based on the salary, then calculate
              the overtime wage based on the overtime multiplier (for
              example,1.5 times on regular days,2 times on weekends: multipliers
              can be set in wage rules).if you select fixed input,the system
              will use the entered value to calculate the hourly wage and then
              apply the same rule to calculate the overtime wage.
            </span>
          </li>
        </ul>
      </div>
      <button className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium">
        Save
      </button>
    </div>
  );
}

export default NormalMonthForm;
