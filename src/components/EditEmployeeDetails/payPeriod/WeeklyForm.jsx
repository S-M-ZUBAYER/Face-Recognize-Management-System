import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import image from "@/constants/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function WeeklyForm() {
  const [basic, setBasic] = useState("");
  const [other, setOther] = useState("");
  const [additionalSalaries, setAdditionalSalaries] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedWeekday, setSelectedWeekday] = useState("");

  const salarySections = [
    {
      id: "input Week",
      label: "Input Week",
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

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
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

  const handleWeekdaySelect = (weekday) => {
    setSelectedWeekday(weekday);
    setShowDatePicker(false);
  };

  const checkboxStyle =
    "data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white";

  return (
    <div className="space-y-5 p-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Label>Select Week start Day</Label>
        </div>
        <div className="w-80 relative">
          <div
            className="w-full border border-gray-300 h-9 rounded-md flex items-center justify-between px-3 cursor-pointer bg-white"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <span className="text-gray-600">
              {selectedWeekday ? selectedWeekday : "Select a weekday"}
            </span>
            <img src={image.calendar} alt="calendar" className="w-4 h-4" />
          </div>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-4 space-y-4">
              <div>
                <p className="font-semibold text-sm mb-2 text-center">
                  Weekly Start Day
                </p>
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Select Start Day
                </p>

                {/* Weekday Select */}
                <div className="mb-3">
                  <Select
                    value={selectedWeekday}
                    onValueChange={handleWeekdaySelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a weekday" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {weekdays.map((weekday) => (
                          <SelectItem key={weekday} value={weekday}>
                            {weekday}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default WeeklyForm;
