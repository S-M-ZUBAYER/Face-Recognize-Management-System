import { useState, useMemo } from "react";
import CustomPagination from "../CustomPagination";
import image from "@/constants/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
// import AttendanceExportMonthly from "./AttendanceExportMonthly";
import EmployeeSalaryDetailsModal from "./EmployeeSalaryDetailsModal";
import SalaryExportMonthly from "./SalaryExportMonthly";

const ITEMS_PER_PAGE = 10;

function SalaryTable({ employees }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [calculatedSalaries, setCalculatedSalaries] = useState({});

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

  // Get selected employee data
  const selectedEmployeeData = employees.filter((emp) =>
    selectedEmployees.includes(emp.employeeId || emp.id)
  );

  // ===================== Salary Calculation =====================
  const handleCalculateSalary = () => {
    const targetEmployees =
      selectedEmployeeData.length > 0 ? selectedEmployeeData : employees;

    const newSalaries = {};

    targetEmployees.forEach((emp) => {
      const baseSalary = emp.salary || 0;
      const workingDays = emp.workingDays || 0;
      const present = emp.present || 0;

      let calculatedSalary = 0;
      if (workingDays > 0) {
        calculatedSalary = (baseSalary / workingDays) * present;
      }

      newSalaries[emp.employeeId || emp.id] = calculatedSalary.toFixed(2); // keep 2 decimals
    });

    setCalculatedSalaries(newSalaries);
  };

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
          <thead className="bg-[#E6ECF0]">
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
                Salary Calc / Edit
              </th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6ECF0]">
            {paginatedEmployee.map((emp, idx) => {
              const empId = emp.employeeId || emp.id;
              return (
                <tr key={empId || idx} className="border-b">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedEmployees.includes(empId)}
                      onCheckedChange={() => handleSelectEmployee(empId)}
                    />
                  </td>
                  <td className="p-3">{emp.name.split("<")[0] || ""}</td>
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
                    {calculatedSalaries[empId] ? (
                      <span className="font-bold text-green-700">
                        {calculatedSalaries[empId]}
                      </span>
                    ) : (
                      <img src={image.Edit} alt="edit" />
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedEmp(emp)}
                      className="bg-[#004368] hover:bg-[#004368] text-[#EAEAEA] px-4 py-1 rounded-lg font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Modal */}
        {selectedEmp && (
          <EmployeeSalaryDetailsModal
            selectedEmp={selectedEmp}
            setSelectedEmp={setSelectedEmp}
          ></EmployeeSalaryDetailsModal>
        )}
      </div>
      <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-500">
        <CustomPagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
        />
        {/* <ExportButton selectedEmployeeData={selectedEmployeeData} /> */}
        <SalaryExportMonthly selectedEmployeeData={selectedEmployeeData} />
        <Button
          onClick={handleCalculateSalary}
          className="flex items-center gap-2 bg-[#004368] hover:bg-[#004368] text-[#EAEAEA] px-8 py-1 rounded-lg font-bold"
        >
          Calculate salary
        </Button>
      </div>
    </>
  );
}

export default SalaryTable;
