import { useState, useMemo } from "react";
import CustomPagination from "../CustomPagination";
import ExportButton from "../ExportButton";
import image from "@/constants/image";
import { Checkbox } from "@/components/ui/checkbox";

const ITEMS_PER_PAGE = 10;

function AdminTable({ admins }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);

  const paginatedEmployee = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return admins.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, admins]);

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
            <tr className="bg-[#E6ECF0]">
              <th className="p-3">Select</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Devices</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployee.map((emp, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-3">
                  <Checkbox />
                </td>
                <td className="p-3">{emp.adminName}</td>
                <td className="p-3">{emp.adminEmail}</td>
                <td className="p-3">{emp.devices.length}</td>
                <td className="p-3">{emp.department || ":)"}</td>
                <td className="p-3">
                  <img src={image.deleteIcon} alt="horizontal" />
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

export default AdminTable;
