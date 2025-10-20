import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FlexibleWorkForm() {
  const [basic, setBasic] = useState("");
  const [other, setOther] = useState("");

  const salarySections = [
    {
      id: "based hour",
      label: "Based Hour",
      value: basic,
      setValue: setBasic,
      placeholder: "000000",
    },
    {
      id: "hourlyFlexible",
      label: "Hourly Flexible Work Schedule Salary",
      value: other,
      setValue: setOther,
      placeholder: "000000",
    },
    {
      id: "minimumWorking",
      label: "Minimum working Minutes",
      value: other,
      setValue: setOther,
      placeholder: "000000",
    },
  ];

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
      </div>

      {/* === Details Section === */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              Set the hourly wage by entering the amount per hour and define the
              minimum time unite for calculation . for example, if the minimum
              unit is 30 minutes,the employee must work at least 30 minutes
              before the wage start to be calculated,and it will be calculated
              in 30 -minute unite. Hourly wages do not include lateness,early
              leave,absence,overtime,weekends,holidays,or leave rules.
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

export default FlexibleWorkForm;
