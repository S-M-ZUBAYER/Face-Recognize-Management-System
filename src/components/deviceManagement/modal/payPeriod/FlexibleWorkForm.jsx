import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import convertNumbersToStrings from "@/lib/convertNumbersToStrings";
import { parseNormalData } from "@/lib/parseNormalData";
import {
  createGlobalPayPeriod,
  updateGlobalPayPeriod,
} from "../../../../utils/updateCreateGlobal";
import { useGlobalStore } from "@/zustand/useGlobalStore";

function FlexibleWorkForm() {
  const [hourlySalary, setHourlySalary] = useState("");
  const [minimumMinutes, setMinimumMinutes] = useState("");
  const selectedPayPeriod = useGlobalStore.getState().selectPayPeriod();
  const { updatePayPeriod } = useGlobalStore();
  const [isUpdate, setIsUpdate] = useState(false);

  const salarySections = [
    {
      id: "based-hour",
      label: "Based Hour",
      value: "1",
      placeholder: "1",
      isReadOnly: true,
      hasValue: true,
    },
    {
      id: "hourly-flexible",
      label: "Hourly Flexible Work Schedule Salary",
      value: hourlySalary,
      setValue: setHourlySalary,
      placeholder: "000000",
      hasValue: !!hourlySalary,
    },
    {
      id: "minimum-working",
      label: "Minimum working Minutes",
      value: minimumMinutes,
      setValue: setMinimumMinutes,
      placeholder: "000000",
      hasValue: !!minimumMinutes,
    },
  ];

  useEffect(() => {
    if (selectedPayPeriod?.payPeriod) {
      const payPeriod = selectedPayPeriod?.payPeriod;

      setHourlySalary(payPeriod.salary?.toString() || "");
      setMinimumMinutes(30);
    }
  }, [selectedPayPeriod]);

  const handleSave = async () => {
    // Create the payPeriod object according to your structure
    setIsUpdate(true);

    if (!hourlySalary || !minimumMinutes) {
      toast.error("Please fill in all required fields.");
      setIsUpdate(false);
      return;
    }

    const payPeriod = selectedPayPeriod?.payPeriod;
    const employeePayPeriod = {
      employeeId: 999,
      hourlyRate: parseFloat(minimumMinutes) || 0, // Minimum working Minutes
      isSelectedFixedHourlyRate: false, // Not used for flexible work
      leave: "",
      name: payPeriod?.name || "", // Default value
      otherSalary: null, // No other salary for flexible work
      overtimeFixed: 0, // Not used for flexible work
      overtimeSalary: 0, // Not used for flexible work
      payPeriod: "hourly",
      salary: parseFloat(hourlySalary) || 0, // Hourly Flexible Work Schedule Salary
      selectedOvertimeOption: 0, // Not used for flexible work
      shift: payPeriod?.shift || "Morning",
      startDay: payPeriod?.startDay, // Default value
      startWeek: null, // Not used for flexible work
      status: null,
    };

    // 🔹 Convert all numeric fields to strings
    const stringifiedEmployeePayPeriod =
      convertNumbersToStrings(employeePayPeriod);

    // 🔹 Convert to JSON string
    const payPeriodJSON = JSON.stringify(stringifiedEmployeePayPeriod);

    try {
      if (selectedPayPeriod) {
        await updateGlobalPayPeriod({ payPeriod: payPeriodJSON });
      } else {
        await createGlobalPayPeriod({ payPeriod: payPeriodJSON });
      }
      // Update Zustand store
      updatePayPeriod({ payPeriod: parseNormalData(payPeriodJSON) });
      toast.success("Employee updated successfully!");
    } catch {
      toast.error("Failed to update employee.");
    } finally {
      setIsUpdate(false);
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
                    if (!checked && !isReadOnly) {
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
          ),
        )}
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
      <button
        className="w-full py-3 bg-[#004368] text-white rounded-lg transition-colors font-medium"
        onClick={handleSave}
      >
        {isUpdate ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default FlexibleWorkForm;
