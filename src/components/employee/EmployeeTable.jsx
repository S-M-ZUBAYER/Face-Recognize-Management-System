import { useState, useMemo } from "react";
import { QrCode, EllipsisVerticalIcon } from "lucide-react";
import CustomPagination from "../CustomPagination";
import ExportButton from "./ExportButton";
import { ShowQrCodeModal } from "./ShowQrcodeModal";
import image from "@/constants/image";

const ITEMS_PER_PAGE = 10;

function EmployeeTable({ employees }) {
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
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 border-b">
            <tr className="bg-[#E6ECF0] ">
              <th className="p-3">Sl</th>
              <th className="p-3">Name</th>
              <th className="p-3">Employee ID</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Department</th>
              <th className="p-3">QR Code</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployee.map((emp, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-3">{String(idx + 1).padStart(2, "0")}</td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.employeeId}</td>
                <td className="p-3">{emp.designation}</td>
                <td className="p-3">{emp.department}</td>
                <td className="p-3">
                  <ShowQrCodeModal
                    deviceMAC={emp.deviceMAC}
                    employeeId={emp.employeeId}
                  />
                </td>
                <td className="p-3">
                  <img src={image.horizontal} alt="horizontal" />
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

export default EmployeeTable;
