import React, { useState, useEffect } from "react";
import LeaveApplicationsList from "@/components/leaveApproval/LeaveApplicationsList";
import LeaveApplicationDetails from "@/components/leaveApproval/LeaveApplicationDetails";
import { useLeaveData } from "@/hook/useLeaveData";
import FancyLoader from "@/components/FancyLoader";

const LeaveApprovalPage = () => {
  const { leaves, isLoading } = useLeaveData();
  const [selectedId, setSelectedId] = useState(null);

  console.log(leaves);
  // Set first leave as selected when data loads
  useEffect(() => {
    if (leaves.length > 0) {
      setSelectedId(leaves[0].id);
    }
  }, [leaves]);

  const selectedApplication = leaves.find((app) => app.id === selectedId);

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] mb-5">
          Leave approval
        </p>
        <FancyLoader />
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="p-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] mb-5">
          Leave approval
        </p>
        <div className="flex items-center justify-center h-[75vh]  rounded-lg">
          <p className="text-gray-500">No leave applications found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] mb-5">
        Leave approval
      </p>
      <div className="h-[75vh] flex gap-4">
        <LeaveApplicationsList
          applications={leaves}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <LeaveApplicationDetails data={selectedApplication} />
      </div>
    </div>
  );
};

export default LeaveApprovalPage;
