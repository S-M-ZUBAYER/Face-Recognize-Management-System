import React, { useState, useMemo } from "react";
import CustomPagination from "../CustomPagination";
import ExportButton from "../ExportButton";
import { Checkbox } from "../ui/checkbox";
import EmployeeModal from "./EmployeeModal";

const ITEMS_PER_PAGE = 10;
const EmployeeManagementTable = ({ employees }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const handleSelectAll = (checked) => {
    if (checked) {
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

  // Get selected employee data to pass to ExportButton
  const selectedEmployeeData = employees.filter((emp) =>
    selectedEmployees.includes(emp.employeeId || emp.id)
  );

  return (
    <>
      <div className="flex items-center gap-2.5 ">
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onCheckedChange={handleSelectAll}
        />
        <p className="text-[#8AA9BA] font-semibold">Select All</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#E6ECF0] border-b border-gray-200">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Select
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Employee ID
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Designation
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Department
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Work Hour
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Overtime
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Settings
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6ECF0]">
            {paginatedEmployee.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <Checkbox
                    checked={selectedEmployees.includes(
                      employee.employeeId || employee.id
                    )}
                    onCheckedChange={() =>
                      handleSelectEmployee(employee.employeeId || employee.id)
                    }
                  />
                </td>
                <td className="p-3 text-sm text-gray-900">{employee.name}</td>
                <td className="p-3 text-sm text-gray-600">
                  {employee.employeeId}
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {employee.designation}
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {employee.department}
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {employee.workHour}
                </td>
                <td className="p-3">
                  <span
                    className={`text-sm ${
                      employee.overtime === "Yes"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {employee.overtime}
                  </span>
                </td>
                <td className="p-3">
                  <EmployeeModal />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-500">
        <CustomPagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
        />
        <ExportButton selectedEmployeeData={selectedEmployeeData} />
      </div>
    </>
  );
};

export default EmployeeManagementTable;
