import { useState, useMemo, useCallback } from "react";
import ExportButton from "../ExportButton";
import { ShowQrCodeModal } from "./ShowQrcodeModal";
import { Checkbox } from "@/components/ui/checkbox";
import EmployeeModal from "../EmployeeModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function EmployeeTable({ employees = [] }) {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Reset selections when employees prop changes
  // useEffect(() => {
  //   setSelectedEmployees([]);
  //   setSearchInput("");
  //   setSearchQuery("");
  // }, [employees]);
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

  // Selection logic - using the same pattern as AttendanceTable
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
      // Clear selections when searching
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

  const handleViewEmployee = useCallback((emp) => {
    setSelectedEmp(emp);
  }, []);

  // Get selected employee data to pass to ExportButton (from all employees, not just filtered)
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
      <div className="overflow-x-auto bg-white  h-[62vh] overflow-y-auto ">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 border-b sticky top-0 z-10">
            <tr className="bg-[#E6ECF0]">
              <th className="p-3">Select</th>
              <th className="p-3">Name</th>
              <th className="p-3">Employee ID</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Department</th>
              <th className="p-3">QR Code</th>
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
                const employeeName = getEmployeeName(emp.name);
                const initials = getInitials(employeeName);

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
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage
                            src={emp.image}
                            alt={`${emp.name}'s profile`}
                          />
                          <AvatarFallback className="text-xs font-medium">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {emp?.name ? emp.name.split("<")[0] : "N/A"}
                      </div>
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
                      <ShowQrCodeModal
                        deviceMAC={emp?.deviceMAC}
                        employeeId={emp?.employeeId || emp?.id}
                      />
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleViewEmployee(emp)}
                        className="bg-[#004368] hover:bg-[#003155] text-[#EAEAEA] px-4 py-1 rounded-lg font-semibold transition-colors"
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

      {/* Employee Modal */}
      {selectedEmp && (
        <EmployeeModal
          selectedEmp={selectedEmp}
          setSelectedEmp={setSelectedEmp}
        />
      )}
    </>
  );
}

export default EmployeeTable;
