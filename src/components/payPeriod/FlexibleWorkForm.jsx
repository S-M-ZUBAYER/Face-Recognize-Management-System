import { useState, useMemo, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import convertJsonForPayPeriod from "@/lib/convertJsonForPayPeriod";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

const SALARY_SECTION_TYPES = {
  BASED_HOUR: "based-hour",
  HOURLY_FLEXIBLE: "hourly-flexible",
  MINIMUM_WORKING: "minimum-working",
};

function FlexibleWorkForm() {
  const [formData, setFormData] = useState({
    hourlySalary: "",
    minimumMinutes: "",
  });

  const { updateEmployee, updating } = useSingleEmployeeDetails();
  const { employees } = useEmployeeStore();
  const Employees = employees();

  const salarySections = useMemo(
    () => [
      {
        id: SALARY_SECTION_TYPES.BASED_HOUR,
        label: "Based Hour",
        value: "1",
        placeholder: "1",
        hasValue: true,
        readOnly: true,
      },
      {
        id: SALARY_SECTION_TYPES.HOURLY_FLEXIBLE,
        label: "Hourly Flexible Work Schedule Salary",
        value: formData.hourlySalary,
        placeholder: "000000",
        hasValue: !!formData.hourlySalary,
        readOnly: false,
      },
      {
        id: SALARY_SECTION_TYPES.MINIMUM_WORKING,
        label: "Minimum working Minutes",
        value: formData.minimumMinutes,
        placeholder: "000000",
        hasValue: !!formData.minimumMinutes,
        readOnly: false,
      },
    ],
    [formData.hourlySalary, formData.minimumMinutes]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Save handler - following the same pattern
  const handleSave = async () => {
    if (Employees.length === 0) {
      toast.error("No employees Have !");
      return;
    }

    try {
      const updatePromises = Employees.map(async (employee) => {
        const payPeriodJSON = convertJsonForPayPeriod(
          employee?.salaryInfo || {},
          {
            employeeId: employee?.employeeId || 0,
            hourlyRate:
              formData.minimumMinutes || employee?.salaryInfo?.hourlyRate,
            isSelectedFixedHourlyRate: false, // Not used for flexible work
            name: employee?.salaryInfo?.name || "",
            otherSalary: null, // No other salary for flexible work
            overtimeFixed: 0, // Not used for flexible work
            overtimeSalary: 0, // Not used for flexible work
            payPeriod: "hourly",
            salary: formData.hourlySalary || employee?.salaryInfo?.salary,
            selectedOvertimeOption: 0, // Not used for flexible work
            shift: employee?.salaryInfo?.shift || "Morning",
            startDay: employee?.salaryInfo?.startDay || 1,
            startWeek: null, // Not used for flexible work
            status: employee?.salaryInfo?.status || null,
          }
        );
        return updateEmployee({
          mac: employee?.deviceMAC || "",
          id: employee?.employeeId,
          payload: { payPeriod: payPeriodJSON },
        });
      });

      await Promise.all(updatePromises);
      toast.success(`Successfully updated ${Employees.length} employee(s)`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update employees");
    }
  };

  const checkboxStyle =
    "data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white";

  return (
    <div className="space-y-5 p-6 w-full">
      {/* Salary Section */}
      <div className="space-y-2">
        {salarySections.map(
          ({ id, label, value, placeholder, hasValue, readOnly }) => (
            <SalaryRow
              key={id}
              id={id}
              label={label}
              value={value}
              placeholder={placeholder}
              hasValue={hasValue}
              readOnly={readOnly}
              checkboxStyle={checkboxStyle}
              onClear={() => {
                if (id === SALARY_SECTION_TYPES.HOURLY_FLEXIBLE) {
                  handleInputChange("hourlySalary", "");
                } else if (id === SALARY_SECTION_TYPES.MINIMUM_WORKING) {
                  handleInputChange("minimumMinutes", "");
                }
              }}
              onChange={(newValue) => {
                if (id === SALARY_SECTION_TYPES.HOURLY_FLEXIBLE) {
                  handleInputChange("hourlySalary", newValue);
                } else if (id === SALARY_SECTION_TYPES.MINIMUM_WORKING) {
                  handleInputChange("minimumMinutes", newValue);
                }
              }}
            />
          )
        )}
      </div>

      {/* Details Section */}
      <DetailsSection />

      {/* Save Button */}
      <Button
        className="w-full py-3 bg-[#004368] text-white rounded-lg font-medium hover:bg-[#003556]"
        onClick={handleSave}
        disabled={updating}
      >
        {updating ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

// Sub-components
const SalaryRow = ({
  id,
  label,
  value,
  placeholder,
  hasValue,
  readOnly,
  checkboxStyle,
  onClear,
  onChange,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3.5">
      <Checkbox
        id={id}
        className={checkboxStyle}
        checked={hasValue}
        onCheckedChange={(checked) => !checked && onClear?.()}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
    <Input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-80"
      placeholder={placeholder}
      type="number"
      readOnly={readOnly}
    />
  </div>
);

const DetailsSection = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
    <ul className="text-sm text-gray-700 space-y-2">
      <li className="flex items-start">
        <span className="font-semibold mr-2">•</span>
        <span>
          Set the hourly wage by entering the amount per hour and define the
          minimum time unit for calculation. For example, if the minimum unit is
          30 minutes, the employee must work at least 30 minutes before the wage
          starts to be calculated, and it will be calculated in 30-minute units.
          Hourly wages do not include lateness, early leave, absence, overtime,
          weekends, holidays, or leave rules.
        </span>
      </li>
    </ul>
  </div>
);

export default FlexibleWorkForm;
