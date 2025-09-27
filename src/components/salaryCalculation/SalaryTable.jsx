import { useState } from "react";
import { EyeClosed } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import EmployeeSalaryDetailsModal from "./EmployeeSalaryDetailsModal";
import SalaryExportMonthly from "./SalaryExportMonthly";

function SalaryTable({ employees }) {
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showSalary, setShowSalary] = useState({});

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

  // --- Search Handlers ---
  const handleSearch = () => {
    setIsSearching(true);
    setSearchQuery(searchInput.trim());
    setTimeout(() => {
      setIsSearching(false);
    }, 500); // simulate async search
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

  // --- Get selected employee data ---
  const selectedEmployeeData = employees.filter((emp) =>
    selectedEmployees.includes(emp.employeeId || emp.id)
  );

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
          <thead className="bg-[#E6ECF0] sticky top-0 z-10">
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
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Working Days
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Present
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Absent
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Salary Calc
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6ECF0]">
            {filteredEmployees.map((emp, idx) => {
              const empId = emp.employeeId || emp.id;
              return (
                <tr
                  key={`employee-${empId}-${idx}`} // Fixed unique key
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedEmployees.includes(empId)}
                      onCheckedChange={() => handleSelectEmployee(empId)}
                    />
                  </td>
                  <td className="p-3">{emp.name?.split("<")[0] || ""}</td>
                  <td className="p-3">{emp?.companyEmployeeId}</td>
                  <td className="p-3">{emp.designation}</td>
                  <td className="p-3">{emp.department}</td>
                  <td className="p-3">{emp.salary || 0}</td>
                  <td className="p-3">
                    {emp?.salaryDetails?.workingDays || 0}
                  </td>
                  <td className="p-3">
                    {Object.values(emp?.salaryDetails?.Present || {}).reduce(
                      (sum, val) => sum + (val || 0),
                      0
                    )}
                  </td>
                  <td className="p-3">{emp?.salaryDetails?.absent || 0}</td>
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

                  <td className="p-3">
                    <button
                      onClick={() => {
                        console.log("Clicking view for:", emp);
                        setSelectedEmp(emp);
                      }}
                      className="bg-[#004368] hover:bg-[#003652] text-[#EAEAEA] px-4 py-1 rounded-lg font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Export */}
      <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-500">
        <SalaryExportMonthly selectedEmployeeData={selectedEmployeeData} />
      </div>

      {/* Modal - MOVED OUTSIDE table container */}
      {selectedEmp && (
        <EmployeeSalaryDetailsModal
          selectedEmp={selectedEmp}
          setSelectedEmp={setSelectedEmp}
        />
      )}
    </>
  );
}

export default SalaryTable;
