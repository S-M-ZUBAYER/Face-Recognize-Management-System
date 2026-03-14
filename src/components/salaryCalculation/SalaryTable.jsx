import { useCallback, useState } from "react";
import { EyeClosed } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import EmployeeSalaryDetailsModal from "./EmployeeSalaryDetailsModal";
import SalaryExportMonthly from "./SalaryExportMonthly";
import HourlyEmployeeDetailsModal from "./HourlyEmployeeDetailsModal";
import WeeklyEmployeeDetailsModal from "./WeeklyEmployeeDetailsModal";
import SemiMonthlyEmployeeDetailsModal from "./SemiMonthlyEmployeeDetailsModal";
import BiweeklyEmployeeDetailsModal from "./BiweeklyEmployeeDetailsModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        : [...prev, employeeId],
    );
  };

  // --- Additional Amount Handler ---
  // const handleAdditionalAmountChange = (employeeId, amount) => {
  //   setAdditionalAmounts((prev) => ({
  //     ...prev,
  //     [employeeId]: parseFloat(amount) || 0,
  //   }));
  // };

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
      // emp.deviceMAC?.toLowerCase().includes(query)
    );
  });

  // const toggleSalary = (empId) => {
  //   setShowSalary((prev) => ({
  //     ...prev,
  //     [empId]: !prev[empId],
  //   }));
  // };

  // avatar function

  const getInitials = useCallback((name) => {
    if (!name) return "??";
    return (
      name
        .split(" ")
        .map((n) => (n && n[0] ? n[0] : ""))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"
    );
  }, []);
  const getEmployeeName = useCallback((fullName) => {
    if (!fullName) return "Unknown";
    return fullName.split("<")[0];
  }, []);

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
            placeholder="Search by Date, Id, Name or Department..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-[16vw] border rounded-md px-3 py-2 text-sm focus:outline-none border-[#004368]"
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
              className="px-4 py-2  hover:bg-[#004368]  bg-[#004368] text-white rounded-md text-sm  transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white h-[62vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#E6ECF0] sticky top-0 z-10">
            <tr>
              {/* Selection column */}
              <th className="p-3 text-sm font-medium text-gray-700 text-center">
                <div className="flex justify-center">
                  <span>Select</span>
                </div>
              </th>

              {/* Employee information */}
              <th className="p-3 text-sm font-medium text-gray-700 text-start">
                <div className="flex justify-start">
                  <span>Name</span>
                </div>
              </th>

              <th className="p-3 text-sm font-medium text-gray-700 text-center">
                <div className="flex justify-center">
                  <span>Employee ID</span>
                </div>
              </th>

              <th className="p-3 text-sm font-medium text-gray-700 text-center">
                <div className="flex justify-center">
                  <span>Designation</span>
                </div>
              </th>

              <th className="p-3 text-sm font-medium text-gray-700 text-center">
                <div className="flex justify-center">
                  <span>Department</span>
                </div>
              </th>

              {/* Salary section */}
              <th className="p-3 text-sm font-medium text-gray-700 text-center">
                <div className="flex justify-center">
                  <span>Basic Salary</span>
                </div>
              </th>

              {/* Working Days - Temporarily hidden */}
              {/* <th className="p-3 text-sm font-medium text-gray-700 text-center">
          <div className="flex justify-center">
            <span>Working Days</span>
          </div>
        </th> */}

              {/* Attendance tracking */}
              <th className="p-3 text-sm font-medium text-gray-700 text-center">
                <div className="flex justify-center items-center gap-1">
                  <span>Present</span>
                </div>
              </th>

              <th className="p-3 text-sm font-medium text-gray-700 text-center">
                <div className="flex justify-center items-center gap-1">
                  <span>Absent</span>
                </div>
              </th>

              {/* Additional Amount - Temporarily hidden */}
              {/* <th className="p-3 text-sm font-medium text-gray-700 text-center">
          <div className="flex justify-center">
            <span>Additional Amount</span>
          </div>
        </th> */}

              {/* Salary Calculation - Temporarily hidden */}
              {/* <th className="p-3 text-sm font-medium text-gray-700 text-center">
          <div className="flex justify-center">
            <span>Salary Calc</span>
          </div>
        </th> */}

              {/* Financial summary */}
              <th className="p-3 text-sm font-medium text-gray-700 text-center">
                <div className="flex justify-center">
                  <span>Total Amount</span>
                </div>
              </th>

              {/* Actions */}
              <th className="p-3 text-sm font-medium text-gray-700 text-center">
                <div className="flex justify-center">
                  <span>Details</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-8">
                  <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                    <div className="text-lg font-medium mb-2">
                      {searchQuery
                        ? "No matching employees found"
                        : "No employees available"}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "Add employees to get started"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-[#004368] hover:text-[#003652] text-sm font-medium px-4 py-2 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Clear search and show all
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee, index) => {
                const employeeId = employee.employeeId || employee.id;
                const presentDays = Object.values(
                  employee?.salaryDetails?.Present || {},
                ).reduce((sum, value) => sum + (value || 0), 0);
                const totalAmount = calculateTotalAmount(employee);
                const employeeName = getEmployeeName(employee.name);
                const initials = getInitials(employeeName);
                const displayName =
                  employee.name?.split("<")[0]?.trim() || "N/A";
                const isSelected = selectedEmployees.includes(employeeId);
                const salaryValue = employee.salary || 0;

                return (
                  <tr
                    key={`employee-${employeeId}-${index}`}
                    className="border-b hover:bg-blue-50/30 transition-colors duration-200 group"
                  >
                    {/* Checkbox selection */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleSelectEmployee(employeeId)
                          }
                          className="data-[state=checked]:bg-[#004368] border-gray-300 hover:border-[#004368]"
                          aria-label={`Select ${displayName}`}
                        />
                      </div>
                    </td>

                    {/* Name with avatar */}
                    <td className="p-3">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="w-10 h-10 flex-shrink-0 ring-1 ring-gray-200">
                            <AvatarImage
                              src={employee.image}
                              alt={`${employee.name}'s profile`}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-xs font-medium bg-blue-100 text-[#004368]">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900 truncate max-w-[180px]">
                            {displayName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <span className="font-medium text-gray-700  px-3 py-1 rounded-md ">
                          {employee?.companyEmployeeId || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <span
                          className="font-medium text-gray-700 max-w-[150px] truncate"
                          title={employee.designation}
                        >
                          {employee.designation || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full  font-medium  ">
                          {employee.department || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Basic Salary */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <span className="">
                          {salaryValue.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Working Days - Temporarily hidden */}
                    {/* <td className="p-3">
                <div className="flex justify-center">
                  <span className="text-gray-700">
                    {employee?.salaryDetails?.workingDays || 0}
                  </span>
                </div>
              </td> */}

                    {/* Present Days */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <span className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-md">
                          {presentDays}
                        </span>
                      </div>
                    </td>

                    {/* Absent Days */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <span className="font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-md">
                          {employee?.salaryDetails?.absent || 0}
                        </span>
                      </div>
                    </td>

                    {/* Additional Amount Input - Temporarily hidden */}
                    {/* <td className="p-3">
                <div className="flex justify-center">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={additionalAmounts[employeeId] || ""}
                    onChange={(e) =>
                      handleAdditionalAmountChange(employeeId, e.target.value)
                    }
                    className="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </td> */}

                    {/* Salary Calculation - Temporarily hidden */}
                    {/* <td className="p-3">
                <div className="flex justify-center">
                  {showSalary[employeeId] ? (
                    <span className="font-bold text-green-700">
                      {employee.salaryDetails?.totalPay?.toLocaleString() || "0"}
                    </span>
                  ) : (
                    <EyeClosed
                      className="cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
                      onClick={() => toggleSalary(employeeId)}
                      size={18}
                    />
                  )}
                </div>
              </td> */}

                    {/* Total Amount */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <span className="font-bold text-black bg-green-50 px-3 py-1.5 rounded-md border border-green-100">
                          {totalAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            console.log("Viewing employee details:", employee);
                            setSelectedEmp(employee);
                          }}
                          className="bg-[#004368] hover:bg-[#003652] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98] min-w-[80px] group-hover:shadow-sm"
                        >
                          View
                        </button>
                      </div>
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
      {(selectedEmp?.salaryInfo?.payPeriod === "normalMonthly" ||
        selectedEmp?.salaryInfo?.payPeriod === "monthly") && (
        <EmployeeSalaryDetailsModal
          selectedEmp={selectedEmp}
          setSelectedEmp={setSelectedEmp}
        />
      )}

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
      {selectedEmp?.salaryInfo?.payPeriod === "biWeekly" && (
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
