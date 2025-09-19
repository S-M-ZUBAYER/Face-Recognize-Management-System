import { useAdminData } from "@/hook/useAdminData";
import AdminTable from "@/components/adminManagement/AdminTable";
import FancyLoader from "@/components/FancyLoader";
import React from "react";

function AdminManagementPage() {
  const { isLoading, admins } = useAdminData();
  console.log(admins);
  return (
    <>
      <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F] mb-5">
        Admin management
      </p>
      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <FancyLoader />
        </div>
      ) : (
        <AdminTable admins={admins} />
      )}
    </>
  );
}

export default AdminManagementPage;
