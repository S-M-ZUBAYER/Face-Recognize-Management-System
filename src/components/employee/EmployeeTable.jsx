import { useState, useMemo, useEffect } from "react";
import CustomPagination from "../CustomPagination";
import ExportButton from "../ExportButton";
import { ShowQrCodeModal } from "./ShowQrcodeModal";
import { Checkbox } from "@/components/ui/checkbox";
import EmployeeModal from "./EmployeeModal";

const ITEMS_PER_PAGE = 10;

function EmployeeTable({ employees }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Reset current page to 1 when employees data changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedEmployees([]);
  }, [employees]);

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);

  const paginatedEmployee = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return employees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, employees]);

  // Selection logic
  const selectedEmployeeIdsSet = useMemo(
    () => new Set(selectedEmployees),
    [selectedEmployees]
  );

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

  const isAllSelected =
    selectedEmployees.length === employees.length && employees.length > 0;
  const isIndeterminate =
    selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

  // Get selected employee data to pass to ExportButton
  const selectedEmployeeData = employees.filter((emp) =>
    selectedEmployees.includes(emp.employeeId || emp.id)
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      {/* Select All Button */}
      <div className="flex items-center gap-2 justify-start mb-2">
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onCheckedChange={handleSelectAll}
          className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
        />
        <p className="text-[#8AA9BA] font-semibold">Select All</p>
      </div>

      <div className="overflow-x-auto bg-white ">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 border-b">
            <tr className="bg-[#E6ECF0] ">
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
            {paginatedEmployee.map((emp, idx) => {
              const empId = emp.employeeId || emp.id || emp.empId;
              const isSelected = selectedEmployeeIdsSet.has(empId);

              return (
                <tr key={idx} className="border-b">
                  <td className="p-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectEmployee(empId)}
                      className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
                    />
                  </td>
                  <td className="p-3">{emp.name.split("<")[0]}</td>
                  <td className="p-3">{emp.companyEmployeeId}</td>
                  <td className="p-3">{emp.designation}</td>
                  <td className="p-3">{emp.department}</td>
                  <td className="p-3">
                    <ShowQrCodeModal
                      deviceMAC={emp.deviceMAC}
                      employeeId={emp.employeeId}
                    />
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
          <EmployeeModal
            selectedEmp={selectedEmp}
            setSelectedEmp={setSelectedEmp}
          ></EmployeeModal>
        )}
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
}

export default EmployeeTable;
