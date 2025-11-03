import { useEmployees } from "@/hook/useEmployees";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import useSelectedEmployeeStore from "@/zustand/useSelectedEmployeeStore";

function EmployeeList() {
  const { Employees = [], isLoading } = useEmployees();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    selectedEmployees,
    setSelectedEmployees,
    removeEmployee,
    clearSelection,
  } = useSelectedEmployeeStore();

  // Create Set of selected IDs
  const selectedEmployeeIdsSet = useMemo(
    () =>
      new Set(
        selectedEmployees.map(
          (emp) => emp.companyEmployeeId || emp.employeeId || emp.id
        )
      ),
    [selectedEmployees]
  );

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return Employees;

    return Employees.filter((emp) => {
      const empId = emp.companyEmployeeId || emp.employeeId || emp.id || "";
      const name = emp.name?.split("<")[0] || "";
      const department = emp.designation || "";
      const query = searchQuery.toLowerCase();

      return (
        empId.toString().toLowerCase().includes(query) ||
        name.toLowerCase().includes(query) ||
        department.toLowerCase().includes(query)
      );
    });
  }, [Employees, searchQuery]);

  // Select all logic
  const isAllSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) => {
      const empId = emp.companyEmployeeId || emp.employeeId || emp.id;
      return selectedEmployeeIdsSet.has(empId);
    });

  const isIndeterminate =
    !isAllSelected &&
    selectedEmployees.length > 0 &&
    filteredEmployees.length > 0;

  // Debounced search
  const handleSearch = useCallback(() => {
    if (searchInput.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setSearchQuery(searchInput);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchInput]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleReset = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
  }, []);

  // Select all toggle
  const handleSelectAll = useCallback(
    (checked) => {
      if (checked) {
        clearSelection();
        filteredEmployees.forEach((emp) => setSelectedEmployees(emp));
      } else {
        clearSelection();
      }
    },
    [filteredEmployees, setSelectedEmployees, clearSelection]
  );

  // Toggle single employee
  const toggleSelectEmployee = useCallback(
    (emp) => {
      const empId = emp.companyEmployeeId || emp.employeeId || emp.id;
      if (selectedEmployeeIdsSet.has(empId)) {
        removeEmployee(empId);
      } else {
        setSelectedEmployees(emp);
      }
    },
    [selectedEmployeeIdsSet, setSelectedEmployees, removeEmployee]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#004368] mx-auto mb-2" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 rounded-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Employee Management
        </h1>
        <p className="text-sm text-gray-600">
          {selectedEmployees.length > 0
            ? `${selectedEmployees.length} employee${
                selectedEmployees.length !== 1 ? "s" : ""
              } selected`
            : "Select employees to manage"}
        </p>
      </div>

      {/* Search + Select All */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368]"
          />
          <p className="text-sm font-semibold text-gray-700">
            Select All{" "}
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {selectedEmployees.length}/{filteredEmployees.length}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none flex items-center gap-2 bg-white border border-gray-300 rounded-lg">
            <Search className="w-4 h-4 text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="Search by ID, Name or Department..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-0 rounded-lg px-3 py-2 text-sm focus:outline-none"
              disabled={isSearching}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!searchInput.trim() || isSearching}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              searchInput.trim() && !isSearching
                ? "bg-[#004368] text-white hover:bg-[#003050]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </span>
            ) : (
              "Search"
            )}
          </button>

          {searchQuery && (
            <button
              onClick={handleReset}
              className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[60vh] flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <tr>
                <th className="p-4"></th>
                <th className="p-4 font-semibold">Employee Name</th>
                <th className="p-4 font-semibold">Employee ID</th>
                <th className="p-4 font-semibold">Designation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((emp, idx) => {
                const empId = emp.companyEmployeeId || emp.employeeId || emp.id;
                const empName = emp.name?.split("<")[0] || "N/A";
                const isSelected = selectedEmployeeIdsSet.has(empId);

                return (
                  <tr
                    key={`${empId}-${idx}`}
                    className={`${
                      isSelected
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectEmployee(emp)}
                        className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368]"
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-900">{empName}</td>
                    <td className="p-4 text-gray-600">{empId || "N/A"}</td>
                    <td className="p-4 text-gray-600 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {emp.designation || "N/A"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredEmployees.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredEmployees.length}</span>{" "}
              of <span className="font-semibold">{Employees.length}</span>{" "}
              employees
            </p>
            {selectedEmployees.length > 0 && (
              <p className="text-sm text-[#004368] font-medium">
                {selectedEmployees.length} selected
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeList;
