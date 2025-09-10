import React, { useState, useMemo } from "react";
import AttendanceTableHeader from "./AttendanceTableHeader";
import AttendanceEmployeeRow from "./AttendanceEmployeeRow";
import CustomPagination from "../CustomPagination";
import AttendanceExport from "./AttendanceExport";
import AttendanceRangeExport from "./AttendanceRangeExport";
import { Checkbox } from "../ui/checkbox";

const ITEMS_PER_PAGE = 10;
const AttendanceTable = ({ employees }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  console.log(employees);

  const handleSelectAll = (checked) => {
    if (checked) {
      // Use employeeId consistently (or id, depending on your data structure)
      setSelectedEmployees(employees.map((emp) => emp.employeeId || emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);

  const paginatedEmployee = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return employees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, employees]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const isAllSelected =
    selectedEmployees.length === employees.length && employees.length > 0;
  const isIndeterminate =
    selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

  const selectedEmployeeData = employees.filter((emp) =>
    selectedEmployees.includes(emp.employeeId || emp.id)
  );

  return (
    <>
      <div className="h-[80vh] w-[75vw] overflow-hidden">
        {/* Top Controls */}
        <div className="flex items-center gap-2.5 mb-2">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onCheckedChange={handleSelectAll}
          />
          <p className="text-[#8AA9BA] font-semibold">Select All</p>
        </div>

        {/* Table Wrapper (scroll enabled) */}
        <div className="overflow-x-auto overflow-y-auto relative h-[65vh]">
          <table className="min-w-full border-collapse">
            <AttendanceTableHeader employees={employees} />
            <tbody className="divide-y divide-[#E6ECF0]">
              {paginatedEmployee.length > 0 ? (
                paginatedEmployee.map((employee) => (
                  <AttendanceEmployeeRow
                    key={employee.employeeId || employee.id}
                    employee={employee}
                    isSelected={selectedEmployees.includes(
                      employee.employeeId || employee.id
                    )}
                    onSelect={() =>
                      handleSelectEmployee(employee.employeeId || employee.id)
                    }
                    showOvertime={true}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-500">
          <CustomPagination
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            totalPages={totalPages}
          />
          <AttendanceExport selectedEmployeeData={selectedEmployeeData} />
        </div>
      </div>
    </>
  );
};

export default AttendanceTable;
