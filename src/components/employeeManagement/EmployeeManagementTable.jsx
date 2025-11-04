import { useState, useMemo, useCallback, useEffect } from "react";
import ExportButton from "../ExportButton";
import { Checkbox } from "../ui/checkbox";
import EmployeeModal from "./EmployeeModal";
import { useOverTimeData } from "@/hook/useOverTimeData";
import { useNavigate } from "react-router-dom";
import SetModal from "./modal/SetModal";

const EmployeeManagementTable = ({ employees = [] }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const Navigate = useNavigate();

  const { overTime } = useOverTimeData();

  // Reset selections when employees prop changes
  useEffect(() => {
    setSelectedEmployees([]);
    setSearchInput("");
    setSearchQuery("");
  }, [employees]);

  const handleNavigate = (employeeId, deviceMAC) => {
    Navigate("editEmployeeDetails/" + employeeId + "/" + deviceMAC);
  };

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;

    const query = searchQuery.toLowerCase().trim();
    return employees.filter((emp) => {
      const name = (emp?.name || "").split("<")[0].toLowerCase();
      const employeeId = (
        emp?.companyEmployeeId ||
        emp?.employeeId ||
        emp?.id ||
        ""
      )
        .toString()
        .toLowerCase();
      const designation = (emp?.designation || "").toLowerCase();
      const department = (emp?.department || "").toLowerCase();

      return (
        name.includes(query) ||
        employeeId.includes(query) ||
        designation.includes(query) ||
        department.includes(query)
      );
    });
  }, [employees, searchQuery]);

  // Selection logic
  const selectedEmployeeIdsSet = useMemo(
    () => new Set(selectedEmployees),
    [selectedEmployees]
  );

  const isAllSelected = useMemo(() => {
    if (filteredEmployees.length === 0) return false;
    return filteredEmployees.every((emp) => {
      const id = emp.companyEmployeeId || emp.employeeId || emp.id;
      return selectedEmployees.includes(id);
    });
  }, [filteredEmployees, selectedEmployees]);

  const isIndeterminate = useMemo(() => {
    if (selectedEmployees.length === 0) return false;
    if (isAllSelected) return false;
    return filteredEmployees.some((emp) => {
      const id = emp.companyEmployeeId || emp.employeeId || emp.id;
      return selectedEmployees.includes(id);
    });
  }, [selectedEmployees, isAllSelected, filteredEmployees]);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      const filteredIds = new Set(
        filteredEmployees.map(
          (emp) => emp.companyEmployeeId || emp.employeeId || emp.id
        )
      );
      setSelectedEmployees((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const filteredIds = filteredEmployees.map(
        (emp) => emp.companyEmployeeId || emp.employeeId || emp.id
      );
      setSelectedEmployees((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  }, [filteredEmployees, isAllSelected]);

  const toggleSelectEmployee = useCallback((id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }, []);

  const handleSearch = useCallback(() => {
    if (searchInput.trim()) {
      setIsSearching(true);
      setSearchQuery(searchInput.trim());
      setSelectedEmployees([]);
      setTimeout(() => setIsSearching(false), 200);
    }
  }, [searchInput]);

  const handleReset = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedEmployees([]);
    setIsSearching(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Check overtime records
  function hasOvertimeRecords(employeeId, overtimeArray = overTime) {
    const today = new Date().toISOString().split("T")[0];
    return overtimeArray.some((record) => {
      const recordDate = record.date.split("T")[0];
      return record.employeeId === employeeId && recordDate === today;
    });
  }

  // Get selected employee data to pass to ExportButton
  const selectedEmployeeData = useMemo(() => {
    return employees.filter((emp) => {
      const id = emp.companyEmployeeId || emp.employeeId || emp.id;
      return selectedEmployees.includes(id);
    });
  }, [employees, selectedEmployees]);

  // Loading state
  if (!employees) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004368]"></div>
        <span className="ml-3">Loading employees...</span>
      </div>
    );
  }

  return (
    <>
      {/* Search and Select All */}
      <div className="flex justify-between items-center mb-4">
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
          {selectedEmployees.length > 1 && (
            <SetModal selectedEmployees={selectedEmployeeData} />
          )}
        </div>

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
          <thead className="text-gray-500 border-b sticky top-0 z-10">
            <tr className="bg-[#E6ECF0]">
              <th className="p-3">Select</th>
              <th className="p-3">Name</th>
              <th className="p-3">Employee ID</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Department</th>
              <th className="p-3">Overtime</th>
              <th className="p-3">Edit</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  {searchQuery
                    ? "No employees found matching your search"
                    : "No employees found"}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, idx) => {
                const empId = emp.companyEmployeeId || emp.employeeId || emp.id;
                const isSelected = selectedEmployeeIdsSet.has(empId);
                const hasOvertime = hasOvertimeRecords(empId);

                return (
                  <tr
                    key={`${empId}-${idx}`}
                    className={`border-b transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectEmployee(empId)}
                        className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
                      />
                    </td>
                    <td className="p-2 font-medium">
                      {emp?.name ? emp.name.split("<")[0] : "N/A"}
                    </td>
                    <td className="p-2">
                      {emp?.companyEmployeeId ||
                        emp?.employeeId ||
                        emp?.id ||
                        "N/A"}
                    </td>
                    <td className="p-2">{emp?.designation || "N/A"}</td>
                    <td className="p-2">{emp?.department || "N/A"}</td>
                    <td className="p-2">
                      <span
                        className={`${
                          hasOvertime ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        {hasOvertime ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-2">
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          handleNavigate(emp.employeeId, emp.deviceMAC)
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M6.12868 14.8713L14.8713 6.12868C15.2802 5.71974 15.4847 5.51527 15.594 5.2947C15.802 4.87504 15.802 4.38232 15.594 3.96265C15.4847 3.74209 15.2802 3.53761 14.8713 3.12868C14.4624 2.71974 14.2579 2.51528 14.0373 2.40597C13.6176 2.19801 13.125 2.19801 12.7053 2.40597C12.4847 2.51528 12.2802 2.71974 11.8713 3.12868L3.12868 11.8713C2.69513 12.3048 2.47836 12.5216 2.36418 12.7972C2.25 13.0729 2.25 13.3795 2.25 13.9926V15.7499H4.00736C4.62049 15.7499 4.92705 15.7499 5.20271 15.6358C5.47836 15.5216 5.69513 15.3048 6.12868 14.8713Z"
                            stroke="#336986"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M9 15.75H13.5"
                            stroke="#336986"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M10.875 4.125L13.875 7.125"
                            stroke="#336986"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                    </td>
                    <td className="p-2">
                      <EmployeeModal employee={emp} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Results Info and Export */}
      {employees.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            Showing {filteredEmployees.length} of {employees.length} employees
            {selectedEmployees.length > 0 && (
              <span className="ml-2 text-[#004368] font-medium">
                ({selectedEmployees.length} selected)
              </span>
            )}
          </p>
          <div className="flex items-center space-x-2">
            <ExportButton
              selectedEmployeeData={selectedEmployeeData}
              disabled={selectedEmployeeData.length === 0}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeManagementTable;
