import { useState } from "react";
import { EyeClosed } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import EmployeeSalaryDetailsModal from "./EmployeeSalaryDetailsModal";
import SalaryExportMonthly from "./SalaryExportMonthly";
import HourlyEmployeeDetailsModal from "./HourlyEmployeeDetailsModal";
import WeeklyEmployeeDetailsModal from "./WeeklyEmployeeDetailsModal";
import BiweeklyEmployeeDetailsModal from "./BiweeklyEmployeeDetailsModal";
import SemiMonthlyEmployeeDetailsModal from "./SemiMonthlyEmployeeDetailsModal";

function SalaryTable({ employees }) {
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showSalary, setShowSalary] = useState({});
  const [additionalAmounts, setAdditionalAmounts] = useState({});

  // --- Search States ---
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // --- Select All Handler ---
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEmployees(employees.map((emp) => emp.employeeId || emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  // --- Individual Employee Select ---
  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // --- Additional Amount Handler ---
  const handleAdditionalAmountChange = (employeeId, amount) => {
    setAdditionalAmounts((prev) => ({
      ...prev,
      [employeeId]: parseFloat(amount) || 0,
    }));
  };

  // --- Calculate Total Amount ---
  const calculateTotalAmount = (emp) => {
    const baseAmount = parseFloat(emp.salaryDetails?.totalPay) || 0;
    const additionalAmount = additionalAmounts[emp.employeeId || emp.id] || 0;
    const total = baseAmount + additionalAmount;
    return Math.round(total); // Remove decimals
  };

  // --- Search Handlers ---
  const handleSearch = () => {
    setIsSearching(true);
    setSearchQuery(searchInput.trim());
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      handleSearch();
    }
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  // --- Selection Logic ---
  const isAllSelected =
    selectedEmployees.length === employees.length && employees.length > 0;
  const isIndeterminate =
    selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

  // --- Get selected employee data with additional amounts ---
  const selectedEmployeeData = employees
    .filter((emp) => selectedEmployees.includes(emp.employeeId || emp.id))
    .map((emp) => ({
      ...emp,
      additionalAmount: additionalAmounts[emp.employeeId || emp.id] || 0,
      totalAmount: calculateTotalAmount(emp),
    }));

  // --- Filter Employees by Search ---
  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(query) ||
      emp.companyEmployeeId?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query)
    );
  });

  const toggleSalary = (empId) => {
    setShowSalary((prev) => ({
      ...prev,
      [empId]: !prev[empId],
    }));
  };

  return (
    <>
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4">
        {/* Select All */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
          />
          <p className="text-[#8AA9BA] font-semibold">
            Select All ({selectedEmployees.length} selected)
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Employee ID, Name or Department..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-72 border rounded-md px-3 py-2 text-sm focus:outline-none border-[#004368]"
            disabled={isSearching}
          />
          <button
            onClick={handleSearch}
            disabled={!searchInput.trim() || isSearching}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              searchInput.trim() && !isSearching
                ? "bg-[#004368] text-white cursor-pointer"
                : "bg-[#004368] text-white cursor-not-allowed"
            }`}
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
          {searchQuery && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-400 text-white rounded-md text-sm hover:bg-gray-500 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white h-[62vh] overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#E6ECF0] sticky top-0 z-10 whitespace-nowrap">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Select
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Employee ID
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Designation
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Department
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Salary
              </th>

              <th className="text-left p-3 text-sm font-medium text-gray-700 ">
                Working Days
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Present
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Absent
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Additional Amount
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Salary Calc
              </th>

              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Total Amount
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="13" className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="text-lg font-medium mb-2">
                      {searchQuery
                        ? "No employees found matching your search"
                        : "No employees available"}
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-[#004368] hover:text-[#003652] text-sm font-medium mt-2"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, idx) => {
                const empId = emp.employeeId || emp.id;
                const presentDays = Object.values(
                  emp?.salaryDetails?.Present || {}
                ).reduce((sum, val) => sum + (val || 0), 0);
                const totalAmount = calculateTotalAmount(emp);

                return (
                  <tr
                    key={`employee-${empId}-${idx}`}
                    className="border-b hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Checkbox */}
                    <td className="p-3">
                      <Checkbox
                        checked={selectedEmployees.includes(empId)}
                        onCheckedChange={() => handleSelectEmployee(empId)}
                        className="data-[state=checked]:bg-[#004368]"
                      />
                    </td>

                    {/* Name */}
                    <td className="p-3 font-medium text-gray-900">
                      {emp.name?.split("<")[0]?.trim() || "N/A"}
                    </td>

                    {/* Employee ID */}
                    <td className="p-3 text-gray-600 font-mono text-sm">
                      {emp?.companyEmployeeId || "N/A"}
                    </td>

                    {/* Designation */}
                    <td className="p-3 text-gray-700">
                      {emp.designation || "N/A"}
                    </td>

                    {/* Department */}
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {emp.department || "N/A"}
                      </span>
                    </td>

                    {/* Salary */}
                    <td className="p-3 text-right font-medium text-gray-900">
                      {emp.salary?.toLocaleString() || "0"}
                    </td>

                    {/* Working Days */}
                    <td className="p-3 text-center text-gray-700">
                      {emp?.salaryDetails?.workingDays || 0}
                    </td>

                    {/* Present Days */}
                    <td className="p-3 text-center">
                      <span className={`font-medium `}>{presentDays}</span>
                    </td>

                    {/* Absent Days */}
                    <td className="p-3 text-center">
                      <span className={`font-medium `}>
                        {emp?.salaryDetails?.absent || 0}
                      </span>
                    </td>
                    {/* Additional Amount Input */}
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={additionalAmounts[empId] || ""}
                        onChange={(e) =>
                          handleAdditionalAmountChange(empId, e.target.value)
                        }
                        className="w-24 no-spinner border rounded-md px-2 py-1 text-sm focus:outline-none border-gray-300"
                      />
                    </td>

                    {/* Salary Visibility */}
                    <td className="p-3">
                      {showSalary[empId] ? (
                        <span className="font-bold text-green-700">
                          {emp.salaryDetails?.totalPay || 0}
                        </span>
                      ) : (
                        <EyeClosed
                          className="cursor-pointer text-gray-600 hover:text-gray-800"
                          onClick={() => toggleSalary(empId)}
                        />
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="p-3 text-right font-bold text-green-700">
                      {totalAmount.toLocaleString()}
                    </td>

                    {/* Action Button */}
                    <td className="p-3">
                      <button
                        onClick={() => {
                          console.log("Viewing employee details:", emp);
                          setSelectedEmp(emp);
                        }}
                        className="bg-[#004368] hover:bg-[#003652] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-md active:scale-95 min-w-[80px]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Export */}
      <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-500">
        <SalaryExportMonthly selectedEmployeeData={selectedEmployeeData} />
      </div>

      {/* Modal */}
      {selectedEmp?.salaryInfo?.payPeriod === "normalMonthly" ||
        (selectedEmp?.salaryInfo?.payPeriod === "monthly" && (
          <EmployeeSalaryDetailsModal
            selectedEmp={selectedEmp}
            setSelectedEmp={setSelectedEmp}
          />
        ))}
      {selectedEmp?.salaryInfo?.payPeriod === "hourly" && (
        <HourlyEmployeeDetailsModal
          selectedEmp={selectedEmp}
          setSelectedEmp={setSelectedEmp}
        />
      )}
      {selectedEmp?.salaryInfo?.payPeriod === "weekly" && (
        <WeeklyEmployeeDetailsModal
          selectedEmp={selectedEmp}
          setSelectedEmp={setSelectedEmp}
        />
      )}
      {selectedEmp?.salaryInfo?.payPeriod === "biweekly" && (
        <BiweeklyEmployeeDetailsModal
          selectedEmp={selectedEmp}
          setSelectedEmp={setSelectedEmp}
        />
      )}
      {selectedEmp?.salaryInfo?.payPeriod === "semiMonthly" && (
        <SemiMonthlyEmployeeDetailsModal
          selectedEmp={selectedEmp}
          setSelectedEmp={setSelectedEmp}
        />
      )}
    </>
  );
}

export default SalaryTable;
