import { useState, useMemo, useCallback } from "react";
import CustomPagination from "../CustomPagination";
import ExportButton from "../ExportButton";
import image from "@/constants/image";
import { Checkbox } from "@/components/ui/checkbox";
import AdminExport from "./AdminExport";

const ITEMS_PER_PAGE = 10;

function AdminTable({ admins }) {
  console.log("admin", admins);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmins, setSelectedAdmins] = useState([]);

  const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);

  const paginatedEmployee = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return admins.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, admins]);

  // Selection logic
  const selectedAdminIdsSet = useMemo(
    () => new Set(selectedAdmins),
    [selectedAdmins]
  );

  const isAllSelected = useMemo(() => {
    if (paginatedEmployee.length === 0) return false;
    return paginatedEmployee.every((admin) => {
      const id = admin.adminId || admin.id || admin.adminEmail;
      return selectedAdmins.includes(id);
    });
  }, [paginatedEmployee, selectedAdmins]);

  const isIndeterminate = useMemo(() => {
    if (selectedAdmins.length === 0) return false;
    if (isAllSelected) return false;
    return paginatedEmployee.some((admin) => {
      const id = admin.adminId || admin.id || admin.adminEmail;
      return selectedAdmins.includes(id);
    });
  }, [selectedAdmins, isAllSelected, paginatedEmployee]);

  const toggleSelectAdmin = useCallback((id) => {
    setSelectedAdmins((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      const paginatedIds = new Set(
        paginatedEmployee.map(
          (admin) => admin.adminId || admin.id || admin.adminEmail
        )
      );
      setSelectedAdmins((prev) => prev.filter((id) => !paginatedIds.has(id)));
    } else {
      const paginatedIds = paginatedEmployee.map(
        (admin) => admin.adminId || admin.id || admin.adminEmail
      );
      setSelectedAdmins((prev) => [...new Set([...prev, ...paginatedIds])]);
    }
  }, [paginatedEmployee, isAllSelected]);

  const selectedEmployee = useMemo(
    () =>
      admins.filter((admin) => {
        const id = admin.adminId || admin.id || admin.adminEmail;
        return selectedAdmins.includes(id);
      }),
    [admins, selectedAdmins]
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

      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 border-b">
            <tr className="bg-[#E6ECF0]">
              <th className="p-3">Select</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Devices</th>
              <th className="p-3">Status</th>
              <th className="p-3">Details</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployee.map((emp, idx) => {
              const adminId = emp.adminId || emp.id || emp.adminEmail;
              const isSelected = selectedAdminIdsSet.has(adminId);

              return (
                <tr key={idx} className="border-b">
                  <td className="p-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectAdmin(adminId)}
                      className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
                    />
                  </td>
                  <td className="p-3">{emp.adminName}</td>
                  <td className="p-3">{emp.adminEmail}</td>
                  <td className="p-3">{emp.devices.length}</td>
                  <td className="p-3">
                    {emp.loggedIn === true ? "Active" : "Inactive"}
                  </td>
                  <td className="p-3">View </td>
                  <td className="p-3">
                    <img src={image.deleteIcon} alt="horizontal" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-500">
        <CustomPagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
        />
        <AdminExport selectedEmployeeData={selectedEmployee} />
      </div>
    </>
  );
}

export default AdminTable;
