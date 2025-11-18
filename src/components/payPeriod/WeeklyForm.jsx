import { useState, useMemo, useCallback } from "react";
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
import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import toast from "react-hot-toast";
import convertJsonForPayPeriod from "@/lib/convertJsonForPayPeriod";
import { useEmployees } from "@/hook/useEmployees";

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
  INPUT_WEEK: "input-week",
  OTHER: "other-salary",
};

const WEEKDAYS_ISO = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function WeeklyForm() {
  const [formData, setFormData] = useState({
    basic: "",
    inputWeek: "",
    workingHours: "",
    overtimeRate: "",
    selectedOvertimeOption: "fixed-input",
    selectedWeekday: "",
  });

  const [additionalSalaries, setAdditionalSalaries] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { Employees } = useEmployees();
  const { updateEmployee, updating } = useSingleEmployeeDetails();

  // Calculate other salary total
  const otherSalaryTotal = useMemo(
    () =>
      additionalSalaries.reduce(
        (total, salary) => total + (parseFloat(salary.amount) || 0),
        0
      ),
    [additionalSalaries]
  );

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
        id: SALARY_SECTION_TYPES.INPUT_WEEK,
        label: "Input Week",
        value: formData.inputWeek,
        placeholder: "000000",
        hasValue: !!formData.inputWeek,
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
    [formData.basic, formData.inputWeek, otherSalaryTotal]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleWeekdaySelect = useCallback((weekday) => {
    setFormData((prev) => ({ ...prev, selectedWeekday: weekday }));
    setShowDatePicker(false);
  }, []);

  const handleOvertimeOptionChange = useCallback((optionId) => {
    // Weekly only supports fixed input, so don't allow changing to auto-calc
    if (optionId === "fixed-input") {
      setFormData((prev) => ({
        ...prev,
        selectedOvertimeOption: "fixed-input",
      }));
    }
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

  // Save handler - following the same pattern
  const handleSave = async () => {
    if (Employees.length === 0) {
      toast.error("No employees have!");
      return;
    }

    const otherSalaryArray = getOtherSalaryArray();
    const selectedWeekdayIndex = WEEKDAYS_ISO.indexOf(formData.selectedWeekday);

    try {
      const updatePromises = Employees.map(async (employee) => {
        const payPeriodJSON = convertJsonForPayPeriod(
          employee?.salaryInfo || {},
          {
            employeeId: employee?.employeeId || 0,
            hourlyRate: formData.inputWeek || employee?.salaryInfo?.hourlyRate,
            isSelectedFixedHourlyRate: true, // Weekly only supports fixed input
            name: formData.workingHours || employee?.salaryInfo?.name,
            otherSalary:
              otherSalaryArray.length > 0
                ? otherSalaryArray
                : employee?.salaryInfo?.otherSalary,
            overtimeFixed:
              formData.overtimeRate || employee?.salaryInfo?.overtimeFixed,
            overtimeSalary: 0, // Not used for Weekly
            payPeriod: "weekly",
            salary: formData.basic || employee?.salaryInfo?.salary,
            selectedOvertimeOption: 2, // Always fixed input for Weekly
            shift: employee?.salaryInfo?.shift || "Morning",
            startDay: formData.selectedWeekday
              ? selectedWeekdayIndex
              : employee?.salaryInfo?.startDay,
            startWeek: null, // Weekly doesn't use startWeek
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
      {/* Week Start Day Picker */}
      <WeekStartDayPicker
        selectedWeekday={formData.selectedWeekday}
        showDatePicker={showDatePicker}
        onToggleDatePicker={() => setShowDatePicker(!showDatePicker)}
        onWeekdaySelect={handleWeekdaySelect}
      />

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
                if (
                  id === SALARY_SECTION_TYPES.BASIC ||
                  id === SALARY_SECTION_TYPES.INPUT_WEEK
                ) {
                  handleInputChange(
                    id === SALARY_SECTION_TYPES.BASIC ? "basic" : "inputWeek",
                    ""
                  );
                }
              }}
              onChange={(newValue) => {
                if (id === SALARY_SECTION_TYPES.BASIC) {
                  handleInputChange("basic", newValue);
                } else if (id === SALARY_SECTION_TYPES.INPUT_WEEK) {
                  handleInputChange("inputWeek", newValue);
                }
              }}
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

      {/* Working Hours */}
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
        checkboxStyle={checkboxStyle}
        onOptionChange={handleOvertimeOptionChange}
        onRateChange={(value) => handleInputChange("overtimeRate", value)}
        isWeekly={true}
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

// Sub-components
const WeekStartDayPicker = ({
  selectedWeekday,
  showDatePicker,
  onToggleDatePicker,
  onWeekdaySelect,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3.5">
      <Label>Select Week start Day</Label>
    </div>
    <div className="w-80 relative">
      <div
        className="w-full border border-gray-300 h-9 rounded-md flex items-center justify-between px-3 cursor-pointer bg-white"
        onClick={onToggleDatePicker}
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
              <Select value={selectedWeekday} onValueChange={onWeekdaySelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a weekday" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {WEEKDAYS_ISO.map((weekday) => (
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
);

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
  checkboxStyle,
  onOptionChange,
  onRateChange,
  isWeekly = false,
}) => (
  <div className="space-y-3">
    <Label className="font-semibold">Select Overtime Rate</Label>
    <div className="flex flex-col space-y-2">
      {options.map(({ id, label, placeholder, disabled }) => (
        <div key={id} className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Checkbox
              id={id}
              className={checkboxStyle}
              checked={selectedOption === id}
              onCheckedChange={(checked) => checked && onOptionChange?.(id)}
              disabled={isWeekly && id === "auto-calc"} // Disable auto-calc for Weekly
            />
            <Label htmlFor={id} className="whitespace-nowrap">
              {label}
            </Label>
          </div>
          <Input
            placeholder={placeholder}
            className="w-80"
            type="number"
            value={selectedOption === id ? overtimeRate : ""}
            onChange={(e) => onRateChange?.(e.target.value)}
            disabled={disabled || (isWeekly && id === "auto-calc")}
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

export default WeeklyForm;
