import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomPagination from "../CustomPagination";
import { Checkbox } from "@/components/ui/checkbox";
import AdminExport from "./AdminExport";
import axios from "axios";
import image from "@/constants/image";

const ITEMS_PER_PAGE = 10;

function AdminTable({ admins }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAdmin, setDialogAdmin] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);

  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return admins.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, admins]);

  const isAllSelected =
    selectedAdmins.length === admins.length && admins.length > 0;
  const isIndeterminate =
    selectedAdmins.length > 0 && selectedAdmins.length < admins.length;

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedAdmins(admins.map((emp) => emp.employeeId || emp.id));
    } else {
      setSelectedAdmins([]);
    }
  };
  const handleSelectAdmin = (employeeId) => {
    setSelectedAdmins((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  // Avoid naming conflict here!
  const selectedAdminsData = admins.filter((emp) =>
    selectedAdmins.includes(emp.employeeId || emp.id)
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openDeleteDialog = (admin) => {
    setDialogAdmin(admin);
    setMessage("");
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!dialogAdmin) return;
    setIsDeleting(true);
    try {
      await axios.delete(
        "https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/admin/unassign",
        {
          data: {
            adminName: dialogAdmin.adminName,
            phone: dialogAdmin.phone,
            adminEmail: dialogAdmin.adminEmail,
            deviceMAC: dialogAdmin.devices[0]?.deviceMAC,
          },
        }
      );

      setSelectedAdmins((prev) =>
        prev.filter((id) => id !== dialogAdmin.adminId)
      );

      setMessage("✅ Admin deleted successfully.");
      setDialogAdmin(null);
    } catch {
      setMessage("❌ Failed to delete admin. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Select All */}
      <div className="flex items-center gap-2 justify-start mb-2">
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onCheckedChange={handleSelectAll}
          className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368]"
        />
        <p className="text-[#8AA9BA] font-semibold">Select All</p>
      </div>

      {/* Table */}
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
            {paginatedAdmins.map((admin, idx) => {
              const adminId = admin.adminId || admin.id || admin.adminEmail;
              const isSelected = selectedAdmins.includes(adminId);
              return (
                <tr key={idx} className="border-b">
                  <td className="p-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectAdmin(adminId)}
                      className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368]"
                    />
                  </td>
                  <td className="p-3">{admin.adminName}</td>
                  <td className="p-3">{admin.adminEmail}</td>
                  <td className="p-3">{admin.devices.length}</td>
                  <td className="p-3">
                    {admin.loggedIn ? "Active" : "Inactive"}
                  </td>
                  <td className="p-3">View</td>
                  <td className="p-3">
                    <img
                      src={image.deleteIcon}
                      alt="Delete"
                      className="cursor-pointer"
                      onClick={() => openDeleteDialog(admin)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination & Export */}
      <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-500">
        <CustomPagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
        />
        <AdminExport selectedEmployeeData={selectedAdminsData} />
      </div>

      {/* Framer Motion Modal */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {message ? (
                <div className="text-center space-y-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                      message.includes("Failed")
                        ? "bg-[#F8D7DA]"
                        : "bg-[#D1E7DD]"
                    }`}
                  >
                    {message.includes("Failed") ? (
                      <img src={image.alert} alt="Alert Icon" className="w-8" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-[#198754]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-lg font-semibold">
                    {message.includes("Failed") ? "Error" : "Success"}
                  </p>
                  <p className="text-gray-500">{message}</p>
                  <button
                    className="px-4 py-2 rounded-lg bg-[#004368] text-white"
                    onClick={() => setDialogOpen(false)}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-[#F8D7DA] rounded-full flex items-center justify-center mx-auto">
                    <img src={image.alert} alt="Alert Icon" className="w-8" />
                  </div>
                  <p className="text-lg font-semibold">Delete Admin</p>
                  <p className="text-gray-500">
                    Are you sure you want to delete this admin account?
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-red-100 text-red-600"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminTable;
