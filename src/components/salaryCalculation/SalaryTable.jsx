import { useState, useMemo } from "react";
import CustomPagination from "../CustomPagination";
import ExportButton from "../ExportButton";
import image from "@/constants/image";
import { Checkbox } from "@/components/ui/checkbox";

const ITEMS_PER_PAGE = 10;

function SalaryTable({ employees }) {
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
      <div className="flex items-center gap-2.5 ">
        <Checkbox />
        <p className="text-[#8AA9BA] font-semibold">Select All</p>
      </div>
      <div className="overflow-x-auto ">
        <table className="w-full">
          <thead className="bg-[#E6ECF0]">
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
                Salary
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Working Days
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Present
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Absent
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">
                Edit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6ECF0]">
            {paginatedEmployee.map((emp, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-3">
                  <Checkbox />
                </td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.employeeId}</td>
                <td className="p-3">{emp.designation}</td>
                <td className="p-3">{emp.department}</td>
                <td className="p-3">{emp.salary}</td>
                <td className="p-3">):</td>
                <td className="p-3">):</td>
                <td className="p-3">):</td>
                <td className="p-3">
                  <img src={image.Edit} alt="horizontal" />
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
        <ExportButton paginatedEmployee={paginatedEmployee} />
      </div>
    </>
  );
}

export default SalaryTable;
