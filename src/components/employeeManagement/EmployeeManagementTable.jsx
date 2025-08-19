import React, { useState, useMemo } from "react";
import { Settings, Search, Download, Save, MoreHorizontal } from "lucide-react";
import CustomPagination from "../CustomPagination";
import ExportButton from "../ExportButton";

const ITEMS_PER_PAGE = 10;
const EmployeeManagementTable = ({ employees }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(employees.map((emp) => emp.id));
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

  const isAllSelected = selectedEmployees.length === employees.length;
  const isIndeterminate =
    selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

  return (
    <>
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
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
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleSelectEmployee(employee.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 text-sm text-gray-900">{employee.name}</td>
                  <td className="p-4 text-sm text-gray-600">{employee.id}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {employee.designation}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {employee.department}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {employee.workHour}
                  </td>
                  <td className="p-4">
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
                  <td className="p-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Settings size={16} />
                    </button>
                  </td>
                </tr>
              ))}
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

export default EmployeeManagementTable;
