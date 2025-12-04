import { useCallback, useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import image from "@/constants/image";
import { useEditEmployeeStore } from "@/zustand/useEditEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import convertNumbersToStrings from "@/lib/convertNumbersToStrings";

function SemiMonthlyForm() {
  const [basic, setBasic] = useState("");
  const [additionalSalaries, setAdditionalSalaries] = useState([]);
  const [workingDay, setWorkingDay] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [overtimeFixed, setOvertimeFixed] = useState("");
  const [selectedOvertimeOption, setSelectedOvertimeOption] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const { selectedEmployee } = useEditEmployeeStore();

  // Calculate other salary total from additional salaries
  const otherSalaryTotal = additionalSalaries.reduce((total, salary) => {
    return total + (parseFloat(salary.amount) || 0);
  }, 0);
  const otherSalaryCheckTotal = useMemo(() => {
    return additionalSalaries
      .filter((d) => d.isChecked)
      .reduce((sum, d) => sum + Number(d.amount), 0);
  }, [additionalSalaries]);
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Calculate automatic overtime when basic, other salary total, or working day changes
  useEffect(() => {
    if (selectedOvertimeOption === "auto-calc" && basic && workingDay) {
      const basicNum = parseFloat(basic) || 0;
      const workingDayNum = parseFloat(workingDay) || 1; // Avoid division by zero
      const calculatedOvertime =
        (basicNum + otherSalaryCheckTotal) / workingDayNum;
      setOvertimeRate(calculatedOvertime.toFixed(2));
    }
  }, [basic, otherSalaryCheckTotal, workingDay, selectedOvertimeOption]);

  useEffect(() => {
    if (selectedEmployee?.payPeriod) {
      const payPeriod = selectedEmployee.payPeriod;

      setBasic(payPeriod.salary?.toString() || "");
      setWorkingDay(payPeriod.hourlyRate?.toString() || "");
      setWorkingHours(payPeriod.name?.toString() || "");
      setOvertimeRate(payPeriod.overtimeSalary?.toString() || "");
      setSelectedDate(payPeriod.startDay?.toString() || "");
      setOvertimeFixed(payPeriod.overtimeFixed?.toString() || "");

      // Set additional salaries from otherSalary array with unique IDs
      const initialAdditionalSalaries = Array.isArray(payPeriod?.otherSalary)
        ? payPeriod.otherSalary.map((salary, index) => ({
            id: Date.now() + index, // unique ID
            type: salary?.type || "",
            amount: salary?.amount?.toString() || "",
            isChecked: salary?.isChecked !== false,
          }))
        : [];
      setAdditionalSalaries(initialAdditionalSalaries);

      // Set overtime option based on selectedOvertimeOption
      if (payPeriod.selectedOvertimeOption === 0) {
        setSelectedOvertimeOption("auto-calc");
      } else if (payPeriod.selectedOvertimeOption === 1) {
        setSelectedOvertimeOption("fixed-input");
      }
    }
  }, [selectedEmployee]);

  const salarySections = [
    {
      id: "basic-salary",
      label: "Basic Salary",
      value: basic,
      setValue: setBasic,
      placeholder: "000000",
      hasValue: !!basic,
    },
    {
      id: "other-salary",
      label: "Others Salary",
      value: otherSalaryTotal.toFixed(2),
      placeholder: "000000",
      hasValue: otherSalaryTotal > 0,
      isReadOnly: true, // Make other salary read-only since it's calculated
    },
  ];

  // Added isChecked: true for new salaries
  const addSalarySection = useCallback(() => {
    setAdditionalSalaries((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        type: "",
        amount: "",
        isChecked: true, // ← ADDED THIS LINE
      },
    ]);
  }, []);

  const removeSalarySection = (id) => {
    setAdditionalSalaries(
      additionalSalaries.filter((salary) => salary.id !== id)
    );
  };

  const updateSalarySectionType = (id, value) => {
    setAdditionalSalaries(
      additionalSalaries.map((salary) =>
        salary.id === id ? { ...salary, type: value } : salary
      )
    );
  };

  const updateSalarySectionAmount = (id, value) => {
    setAdditionalSalaries(
      additionalSalaries.map((salary) =>
        salary.id === id ? { ...salary, amount: value } : salary
      )
    );
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleOvertimeOptionChange = (optionId) => {
    setSelectedOvertimeOption(optionId);

    // If switching to fixed input, clear the auto-calculated value
    if (optionId === "fixed-input") {
      setOvertimeRate("");
    }
  };

  // Added this new function
  const toggleSalaryCheckbox = useCallback((id, checked) => {
    setAdditionalSalaries((prev) =>
      prev.map((salary) =>
        salary.id === id ? { ...salary, isChecked: checked } : salary
      )
    );
  }, []);

  const handleSave = async () => {
    // Filter out empty additional salaries
    const otherSalaryArray = additionalSalaries
      .filter((salary) => salary.type && salary.amount)
      .map((salary) => ({
        isChecked: salary.isChecked !== false,
        type: salary.type,
        amount: parseFloat(salary.amount) || 0,
      }));

    // Create the payPeriod object according to your structure
    const employeePayPeriod = {
      employeeId: selectedEmployee?.employeeId || 0,
      hourlyRate: 26, // Default for semi-monthly
      isSelectedFixedHourlyRate: selectedOvertimeOption === "fixed-input",
      leave: "",
      name: parseInt(workingHours) || 8,
      otherSalary: otherSalaryArray,
      overtimeFixed:
        selectedOvertimeOption === "fixed-input"
          ? parseFloat(overtimeRate) || 0
          : 0,
      overtimeSalary:
        selectedOvertimeOption === "auto-calc"
          ? parseFloat(overtimeRate) || 0
          : 0,
      payPeriod: "semiMonthly",
      salary: parseFloat(basic) || 0,
      selectedOvertimeOption: selectedOvertimeOption === "auto-calc" ? 0 : 1,
      shift: selectedEmployee?.payPeriod?.shift || "Morning",
      startDay: parseInt(selectedDate) || 1,
      startWeek: null,
      status: null,
    };

    // 🔹 Convert all numeric fields to strings
    const stringifiedEmployeePayPeriod =
      convertNumbersToStrings(employeePayPeriod);

    // 🔹 Convert to JSON string
    const payPeriodJSON = JSON.stringify(stringifiedEmployeePayPeriod);

    try {
      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload: { payPeriod: payPeriodJSON },
      });
      toast.success("Employee updated successfully!");
    } catch {
      toast.error("Failed to update employee.");
    }
  };

  const checkboxStyle =
    "data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white";

  return (
    <div className="space-y-5 p-6 w-full">
      {/* === Salary Section === */}
      <div className="space-y-2">
        {salarySections.map(
          ({
            id,
            label,
            value,
            setValue,
            placeholder,
            hasValue,
            isReadOnly,
          }) => (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <Checkbox
                  id={id}
                  className={checkboxStyle}
                  checked={hasValue}
                  onCheckedChange={(checked) => {
                    if (!checked && id === "basic-salary") {
                      setValue("");
                    }
                  }}
                />
                <Label htmlFor={id}>{label}</Label>
              </div>
              <Input
                value={value}
                onChange={
                  isReadOnly ? undefined : (e) => setValue(e.target.value)
                }
                className="w-80"
                placeholder={placeholder}
                type={"number"}
                readOnly={isReadOnly}
              />
            </div>
          )
        )}

        {/* Additional Salary Sections */}
        {additionalSalaries.map((salary) => (
          <div key={salary.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <Checkbox
                className={checkboxStyle}
                checked={salary.isChecked !== false}
                onCheckedChange={(checked) =>
                  toggleSalaryCheckbox(salary.id, checked)
                }
              />
              <div className="flex gap-2">
                <Input
                  value={salary.type}
                  onChange={(e) =>
                    updateSalarySectionType(salary.id, e.target.value)
                  }
                  className="w-40"
                  placeholder="Salary Type"
                />
                <Input
                  value={salary.amount}
                  onChange={(e) =>
                    updateSalarySectionAmount(salary.id, e.target.value)
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

      {/* === Semi-Monthly End Day === */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Label>End Day</Label>
        </div>
        <div className="w-80 relative">
          <div
            className="w-full border border-gray-300 h-9 rounded-md flex items-center justify-between px-3 cursor-pointer bg-white"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <span className="text-gray-600">
              {selectedDate ? `Day ${selectedDate}` : "Select Day"}
            </span>
            <img src={image.calendar} alt="calendar" className="w-4 h-4" />
          </div>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-3">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 17 }, (_, i) => i + 1).map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm hover:bg-blue-100 ${
                      selectedDate === date.toString()
                        ? "bg-[#004368] text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === Working Hours === */}
      <div className="flex justify-between">
        <Label className="font-semibold whitespace-nowrap">
          Add Working Hours
        </Label>
        <Input
          placeholder="8"
          className="w-80"
          type={"number"}
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value)}
        />
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
                <Checkbox
                  id={id}
                  className={checkboxStyle}
                  checked={selectedOvertimeOption === id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleOvertimeOptionChange(id);
                    }
                  }}
                />
                <Label htmlFor={id} className="whitespace-nowrap">
                  {label}
                </Label>
              </div>
              <Input
                placeholder={placeholder}
                className="w-80"
                type={"number"}
                value={
                  selectedOvertimeOption === id ? overtimeRate : overtimeFixed
                }
                onChange={(e) => setOvertimeRate(e.target.value)}
                disabled={id === "auto-calc"} // Disable input for auto-calc
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
      <button
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium"
        onClick={handleSave}
      >
        {updating ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default SemiMonthlyForm;
