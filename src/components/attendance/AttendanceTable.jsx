import React, { useState, useMemo } from "react";

import AttendanceTableHeader from "./AttendanceTableHeader";
import AttendanceEmployeeRow from "./AttendanceEmployeeRow";
import CustomPagination from "../CustomPagination";
import ExportButton from "../ExportButton";

const ITEMS_PER_PAGE = 10;
const AttendanceTable = ({
  employees,
  selectedEmployees,
  onSelectAll,
  onSelectEmployee,
  showOvertime = true,
}) => {
  const isAllSelected =
    selectedEmployees.length === employees.length && employees.length > 0;
  const isIndeterminate =
    selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

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

  return (
    <>
      <div className="bg-white  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <AttendanceTableHeader
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              onSelectAll={onSelectAll}
            />
            <tbody className="divide-y divide-[#E6ECF0] ">
              {paginatedEmployee.length > 0 ? (
                paginatedEmployee.map((employee) => (
                  <AttendanceEmployeeRow
                    key={employee.employeeId}
                    employee={employee}
                    isSelected={selectedEmployees.includes(employee.employeeId)}
                    onSelect={onSelectEmployee}
                    showOvertime={showOvertime}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No employees found for this filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-500">
        <CustomPagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
        />
        <ExportButton paginatedEmployee={paginatedEmployee} />
      </div>
    </>
  );
};

export default AttendanceTable;
