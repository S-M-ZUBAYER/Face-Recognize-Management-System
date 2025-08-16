import { useAdminData } from "@/hook/useAdminData";
import AdminTable from "@/components/adminManagement/AdminTable";
import React from "react";

function AdminManagementPage() {
  const { admins } = useAdminData();
  return (
    <>
      <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F] mb-5">
        Admin management
      </p>
      <AdminTable admins={admins} />
    </>
  );
}

export default AdminManagementPage;
