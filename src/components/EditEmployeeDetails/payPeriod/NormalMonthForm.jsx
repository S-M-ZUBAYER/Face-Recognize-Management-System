import { useEffect, useState, useMemo, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEditEmployeeStore } from "@/zustand/useEditEmployeeStore";
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import convertJsonForPayPeriod from "@/lib/convertJsonForPayPeriod";

const OVERTIME_OPTIONS = [
  {
    id: "auto-calc",
    label: "Automatic Calculation (Day)",
    placeholder: "000",
    disabled: true,
  },
  {
    id: "fixed-input",
    label: "Fixed Input (Hour)",
    placeholder: "Enter Overtime Rate",
    disabled: false,
  },
];

const SALARY_SECTION_TYPES = {
  BASIC: "basic-salary",
  OTHER: "other-salary",
};

function NormalMonthForm() {
  const [formData, setFormData] = useState({
    basic: "",
    workingDay: "",
    workingHours: "",
    overtimeRate: "",
    overtimeFixed: "",
    selectedOvertimeOption: "",
  });

  const [additionalSalaries, setAdditionalSalaries] = useState([]);
  const { selectedEmployee } = useEditEmployeeStore();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Calculate other salary total
  const otherSalaryTotal = additionalSalaries.reduce((total, salary) => {
    return total + (parseFloat(salary.amount) || 0);
  }, 0);
  const otherSalaryCheckTotal = useMemo(() => {
    return additionalSalaries
      .filter((d) => d.isChecked)
      .reduce((sum, d) => sum + Number(d.amount), 0);
  }, [additionalSalaries]);

  // Calculate automatic overtime when basic, other salary total, or working day changes
  useEffect(() => {
    if (
      formData.selectedOvertimeOption === "auto-calc" &&
      formData.basic &&
      formData.workingDay
    ) {
      const basicNum = parseFloat(formData.basic) || 0;
      const workingDayNum = parseFloat(formData.workingDay) || 1; // Avoid division by zero
      const calculatedOvertime =
        (basicNum + otherSalaryCheckTotal) / workingDayNum;
      setFormData((prev) => ({
        ...prev,
        overtimeRate: calculatedOvertime.toFixed(2),
      }));
    }
  }, [
    formData.basic,
    otherSalaryCheckTotal,
    formData.workingDay,
    formData.selectedOvertimeOption,
  ]);

  // Load employee data
  useEffect(() => {
    if (selectedEmployee?.payPeriod) {
      const payPeriod = selectedEmployee.payPeriod;

      setFormData({
        basic: payPeriod.salary?.toString() || "",
        workingDay: payPeriod.hourlyRate?.toString() || "",
        workingHours: payPeriod.name?.toString() || "",
        overtimeRate: payPeriod.overtimeSalary?.toString() || "",
        overtimeFixed: payPeriod.overtimeFixed?.toString() || "",
        selectedOvertimeOption:
          payPeriod.selectedOvertimeOption === 0
            ? "auto-calc"
            : payPeriod.selectedOvertimeOption === 1
            ? "fixed-input"
            : "",
      });

      // Set additional salaries from otherSalary array with isChecked status
      const initialAdditionalSalaries = Array.isArray(payPeriod?.otherSalary)
        ? payPeriod.otherSalary.map((salary, index) => ({
            id: Date.now() + index,
            type: salary?.type || "",
            amount: salary?.amount?.toString() || "",
            isChecked: salary?.isChecked !== false, // Default to true if not specified
          }))
        : [];
      setAdditionalSalaries(initialAdditionalSalaries);
    }
  }, [selectedEmployee]);

  const salarySections = useMemo(
    () => [
      {
        id: SALARY_SECTION_TYPES.BASIC,
        label: "Basic Salary",
        value: formData.basic,
        placeholder: "000000",
        hasValue: !!formData.basic,
        readOnly: false,
      },
      {
        id: SALARY_SECTION_TYPES.OTHER,
        label: "Others Salary",
        value: otherSalaryTotal.toFixed(2),
        placeholder: "000000",
        hasValue: otherSalaryTotal > 0,
        readOnly: true,
      },
    ],
    [formData.basic, otherSalaryTotal]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOvertimeOptionChange = useCallback((optionId) => {
    setFormData((prev) => ({
      ...prev,
      selectedOvertimeOption: optionId,
      // Clear overtime rate when switching to fixed input
      ...(optionId === "fixed-input" && { overtimeRate: "" }),
    }));
  }, []);

  // Additional salary management
  const addSalarySection = useCallback(() => {
    setAdditionalSalaries((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        type: "",
        amount: "",
        isChecked: true, // Default to checked when adding new
      },
    ]);
  }, []);

  const removeSalarySection = useCallback((id) => {
    setAdditionalSalaries((prev) => prev.filter((salary) => salary.id !== id));
  }, []);

  const updateSalarySection = useCallback((id, field, value) => {
    setAdditionalSalaries((prev) =>
      prev.map((salary) =>
        salary.id === id ? { ...salary, [field]: value } : salary
      )
    );
  }, []);

  // Toggle checkbox for additional salary
  const toggleSalaryCheckbox = useCallback((id, checked) => {
    setAdditionalSalaries((prev) =>
      prev.map((salary) =>
        salary.id === id ? { ...salary, isChecked: checked } : salary
      )
    );
  }, []);

  // Prepare other salary array with isChecked status
  const getOtherSalaryArray = useCallback(
    () =>
      additionalSalaries
        .filter((salary) => salary.type.trim() && salary.amount)
        .map((salary) => ({
          isChecked: salary.isChecked !== false, // Default to true if not specified
          type: salary.type.trim(),
          amount: parseFloat(salary.amount) || 0,
        })),
    [additionalSalaries]
  );

  // Save handler
  const handleSave = async () => {
    if (!selectedEmployee) {
      toast.error("No employee selected");
      return;
    }

    const otherSalaryArray = getOtherSalaryArray();

    try {
      const payPeriodJSON = convertJsonForPayPeriod(
        selectedEmployee?.payPeriod || {},
        {
          employeeId: selectedEmployee?.employeeId || 0,
          hourlyRate:
            formData.workingDay || selectedEmployee?.payPeriod?.hourlyRate,
          isSelectedFixedHourlyRate: formData.selectedOvertimeOption
            ? formData.selectedOvertimeOption === "fixed-input"
            : selectedEmployee?.payPeriod?.isSelectedFixedHourlyRate,
          name: formData.workingHours || selectedEmployee?.payPeriod?.name,
          otherSalary:
            otherSalaryArray.length > 0
              ? otherSalaryArray
              : selectedEmployee?.payPeriod?.otherSalary,
          overtimeFixed:
            formData.selectedOvertimeOption === "fixed-input"
              ? formData.overtimeRate
              : selectedEmployee?.payPeriod?.overtimeFixed,
          overtimeSalary:
            formData.selectedOvertimeOption === "auto-calc"
              ? parseFloat(formData.overtimeRate) || 0
              : selectedEmployee?.payPeriod?.overtimeSalary,
          payPeriod: "normalMonthly",
          salary: formData.basic || selectedEmployee?.payPeriod?.salary,
          selectedOvertimeOption:
            formData.selectedOvertimeOption === "auto-calc"
              ? 0
              : formData.selectedOvertimeOption === "fixed-input"
              ? 1
              : selectedEmployee?.payPeriod?.selectedOvertimeOption,
          shift: selectedEmployee?.payPeriod?.shift || "Morning",
          startDay: selectedEmployee?.payPeriod?.startDay || 1,
          startWeek: selectedEmployee?.payPeriod?.startWeek || null,
          status: selectedEmployee?.payPeriod?.status || null,
        }
      );

      await updateEmployee({
        mac: selectedEmployee?.deviceMAC || "",
        id: selectedEmployee?.employeeId,
        payload: { payPeriod: payPeriodJSON },
      });
      toast.success("Employee updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update employee.");
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
              onClear={() =>
                id === SALARY_SECTION_TYPES.BASIC &&
                handleInputChange("basic", "")
              }
              onChange={(newValue) => handleInputChange("basic", newValue)}
            />
          )
        )}

        {/* Additional Salary Sections */}
        {additionalSalaries.map((salary) => (
          <AdditionalSalaryRow
            key={salary.id}
            salary={salary}
            checkboxStyle={checkboxStyle}
            onTypeChange={(value) =>
              updateSalarySection(salary.id, "type", value)
            }
            onAmountChange={(value) =>
              updateSalarySection(salary.id, "amount", value)
            }
            onRemove={() => removeSalarySection(salary.id)}
            onCheckboxChange={(checked) =>
              toggleSalaryCheckbox(salary.id, checked)
            }
          />
        ))}

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="mt-2 flex items-center bg-[#E6ECF0] px-12 py-4"
            onClick={addSalarySection}
          >
            <Plus className="w-4 h-4 text-[#004368] mr-2" />
            Add another salary section
          </Button>
        </div>
      </div>

      {/* Working Information */}
      <WorkingField
        label="Add Working Day"
        placeholder="26 Days"
        value={formData.workingDay}
        onChange={(value) => handleInputChange("workingDay", value)}
      />

      <WorkingField
        label="Add Working Hours"
        placeholder="8"
        value={formData.workingHours}
        onChange={(value) => handleInputChange("workingHours", value)}
      />

      {/* Overtime Rate Section */}
      <OvertimeSection
        options={OVERTIME_OPTIONS}
        selectedOption={formData.selectedOvertimeOption}
        overtimeRate={formData.overtimeRate}
        overtimeFixed={formData.overtimeFixed}
        checkboxStyle={checkboxStyle}
        onOptionChange={handleOvertimeOptionChange}
        onRateChange={(value) => handleInputChange("overtimeRate", value)}
        onFixedChange={(value) => handleInputChange("overtimeFixed", value)}
      />

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

// Sub-components for better organization
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

const AdditionalSalaryRow = ({
  salary,
  checkboxStyle,
  onTypeChange,
  onAmountChange,
  onRemove,
  onCheckboxChange,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3.5">
      <Checkbox
        className={checkboxStyle}
        checked={salary.isChecked !== false} // Default to true
        onCheckedChange={(checked) => onCheckboxChange?.(checked)}
      />
      <div className="flex gap-2">
        <Input
          value={salary.type}
          onChange={(e) => onTypeChange?.(e.target.value)}
          className="w-40"
          placeholder="Salary Type"
        />
        <Input
          value={salary.amount}
          onChange={(e) => onAmountChange?.(e.target.value)}
          className="w-40"
          placeholder="Amount"
          type="number"
        />
      </div>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={onRemove}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
);

const WorkingField = ({ label, placeholder, value, onChange }) => (
  <div className="flex justify-between">
    <Label className="font-semibold whitespace-nowrap">{label}</Label>
    <Input
      placeholder={placeholder}
      className="w-80"
      type="number"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

const OvertimeSection = ({
  options,
  selectedOption,
  overtimeRate,
  overtimeFixed,
  checkboxStyle,
  onOptionChange,
  onRateChange,
  onFixedChange,
}) => (
  <div className="space-y-3">
    <Label className="font-semibold">Select Overtime Rate</Label>
    <div className="flex flex-col space-y-2">
      {options.map(({ id, label, placeholder, disabled }, index) => (
        <div key={id} className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Checkbox
              id={id}
              className={checkboxStyle}
              checked={selectedOption === id}
              onCheckedChange={(checked) => checked && onOptionChange?.(id)}
            />
            <Label htmlFor={id} className="whitespace-nowrap">
              {label}
            </Label>
          </div>
          <Input
            placeholder={placeholder}
            className="w-80"
            type="number"
            value={index === 0 ? overtimeRate : overtimeFixed}
            onChange={(e) =>
              index === 0
                ? onRateChange?.(e.target.value)
                : onFixedChange?.(e.target.value)
            }
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  </div>
);

const DetailsSection = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
    <ul className="text-sm text-gray-700 space-y-2">
      <li className="flex items-start">
        <span className="font-semibold mr-2">•</span>
        <span>
          If you select the automatic calculation option, the system will
          calculate the base hourly wage based on the salary, then calculate the
          overtime wage based on the overtime multiplier (for example, 1.5 times
          on regular days, 2 times on weekends: multipliers can be set in wage
          rules). If you select fixed input, the system will use the entered
          value to calculate the hourly wage and then apply the same rule to
          calculate the overtime wage.
        </span>
      </li>
    </ul>
  </div>
);

export default NormalMonthForm;
