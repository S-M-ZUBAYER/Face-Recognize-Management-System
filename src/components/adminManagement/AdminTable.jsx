import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomPagination from "../CustomPagination";
import { Checkbox } from "@/components/ui/checkbox";
import AdminExport from "./AdminExport";
import image from "@/constants/image";
import { useAdminData } from "@/hook/useAdminData";

const ITEMS_PER_PAGE = 10;

function AdminTable() {
  const { admins, deleteAdmin, isDeleting } = useAdminData();
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAdmin, setDialogAdmin] = useState(null);
  const [message, setMessage] = useState("");

  console.log(admins);

  // Memoized calculations
  const totalPages = useMemo(
    () => Math.ceil(admins.length / ITEMS_PER_PAGE),
    [admins.length]
  );

  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return admins.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, admins]);

  // Selection state calculations
  const selectedAdminIdsSet = useMemo(
    () => new Set(selectedAdmins),
    [selectedAdmins]
  );

  const isAllPageSelected = useMemo(() => {
    if (paginatedAdmins.length === 0) return false;
    return paginatedAdmins.every((admin) => {
      const id = admin.adminId || admin.id || admin.adminEmail;
      return selectedAdmins.includes(id);
    });
  }, [paginatedAdmins, selectedAdmins]);

  const isIndeterminate = useMemo(() => {
    if (selectedAdmins.length === 0) return false;
    if (isAllPageSelected) return false;
    return paginatedAdmins.some((admin) => {
      const id = admin.adminId || admin.id || admin.adminEmail;
      return selectedAdmins.includes(id);
    });
  }, [selectedAdmins, isAllPageSelected, paginatedAdmins]);

  const selectedAdminsData = useMemo(
    () =>
      admins.filter((admin) => {
        const id = admin.adminId || admin.id || admin.adminEmail;
        return selectedAdmins.includes(id);
      }),
    [admins, selectedAdmins]
  );

  // Adjust current page if it becomes invalid after data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Optimized handlers
  const handleSelectAll = useCallback(() => {
    if (isAllPageSelected) {
      // Unselect current page admins
      const currentPageIds = new Set(
        paginatedAdmins.map(
          (admin) => admin.adminId || admin.id || admin.adminEmail
        )
      );
      setSelectedAdmins((prev) => prev.filter((id) => !currentPageIds.has(id)));
    } else {
      // Select current page admins
      const currentPageIds = paginatedAdmins.map(
        (admin) => admin.adminId || admin.id || admin.adminEmail
      );
      setSelectedAdmins((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  }, [isAllPageSelected, paginatedAdmins]);

  const handleSelectAdmin = useCallback((adminId) => {
    setSelectedAdmins((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    );
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const openDeleteDialog = useCallback((admin) => {
    setDialogAdmin(admin);
    setMessage("");
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setMessage("");
    setDialogAdmin(null);
  }, []);

  const handleDelete = async () => {
    if (!dialogAdmin) return;

    try {
      await deleteAdmin(dialogAdmin);

      setMessage("Admin deleted successfully.");

      setTimeout(() => {
        closeDialog();
      }, 2000);
    } catch (error) {
      console.error("Delete admin error:", error);
      setMessage("Failed to delete admin. Please try again.");
    }
  };

  // Loading state
  if (!admins) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004368]"></div>
        <span className="ml-3">Loading admins...</span>
      </div>
    );
  }

  return (
    <>
      {/* Select All */}
      <div className="flex items-center gap-2 justify-start mb-2">
        <Checkbox
          checked={isAllPageSelected}
          indeterminate={isIndeterminate}
          onCheckedChange={handleSelectAll}
          className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
        />
        <p className="text-[#8AA9BA] font-semibold">
          Select All ({selectedAdmins.length} selected)
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white ">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 border-b">
            <tr className="bg-[#E6ECF0]">
              <th className="p-3 ">Select</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3 ">Number</th>
              <th className="p-3 ">Devices</th>
              <th className="p-3 ">Status</th>
              <th className="p-3 ">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAdmins.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  {admins.length === 0
                    ? "No admins found"
                    : "No admins on this page"}
                </td>
              </tr>
            ) : (
              paginatedAdmins.map((admin, idx) => {
                const adminId = admin.adminId || admin.id || admin.adminEmail;
                const isSelected = selectedAdminIdsSet.has(adminId);

                return (
                  <tr
                    key={idx}
                    className={`border-b transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectAdmin(adminId)}
                        className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
                      />
                    </td>
                    <td className="p-3 font-medium">
                      {admin.adminName || "N/A"}
                    </td>
                    <td className="p-3">{admin.adminEmail || "N/A"}</td>
                    <td className="p-3">
                      <p className=" text-sm font-medium">
                        {admin.phone || "N/A"}
                      </p>
                    </td>
                    <td className="p-3 ">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {admin.devices?.length || 0}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          admin.loggedIn
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {admin.loggedIn ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => openDeleteDialog(admin)}
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                        aria-label="Delete admin"
                      >
                        <img
                          src={image.deleteIcon}
                          alt="Delete"
                          className="w-4 h-4"
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Export */}
      {admins.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, admins.length)} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, admins.length)} of{" "}
            {admins.length} admins
          </p>
          <div className="flex items-center space-x-2">
            <CustomPagination
              currentPage={currentPage}
              handlePageChange={handlePageChange}
              totalPages={totalPages}
            />
            <AdminExport
              selectedEmployeeData={selectedAdminsData}
              disabled={selectedAdminsData.length === 0}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            className="fixed inset-0  bg-black/5 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && closeDialog()}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {message ? (
                <div className="text-center space-y-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                      message.includes("Failed") ? "bg-red-100" : "bg-green-100"
                    }`}
                  >
                    {message.includes("Failed") ? (
                      <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">
                    {message.includes("Failed") ? "Error" : "Success"}
                  </h3>
                  <p className="text-gray-600">{message}</p>
                  {message.includes("Failed") && (
                    <button
                      className="px-4 py-2 rounded-lg bg-[#004368] text-white hover:bg-[#003155] transition-colors"
                      onClick={closeDialog}
                    >
                      Close
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.734 0L3.026 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">Delete Admin</h3>
                  <p className="text-gray-600">
                    Are you sure you want to delete{" "}
                    <strong>{dialogAdmin?.adminName}</strong>? This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-center gap-3 mt-6">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                      onClick={closeDialog}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="opacity-25"
                            ></circle>
                            <path
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              className="opacity-75"
                            ></path>
                          </svg>
                          Deleting...
                        </span>
                      ) : (
                        "Delete"
                      )}
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
