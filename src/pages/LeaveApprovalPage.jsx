import React, { useState, useEffect, useMemo, useCallback } from "react";
import LeaveApplicationsList from "@/components/leaveApproval/LeaveApplicationsList";
import LeaveApplicationDetails from "@/components/leaveApproval/LeaveApplicationDetails";
import { useLeaveData } from "@/hook/useLeaveData";
import FancyLoader from "@/components/FancyLoader";

const LeaveApprovalPage = () => {
  const { leaves, isLoading, error } = useLeaveData();
  const [selectedId, setSelectedId] = useState(null);

  // Memoize the selected application to avoid recalculations
  const selectedApplication = useMemo(
    () => leaves.find((app) => app.id === selectedId),
    [leaves, selectedId]
  );

  // Set first leave as selected when data loads
  useEffect(() => {
    if (leaves.length > 0 && !selectedId) {
      const firstValidLeave = leaves.find((leave) => leave?.id) || leaves[0];
      setSelectedId(firstValidLeave?.id);
    }
  }, [leaves, selectedId]);

  // Handle application selection with validation
  const handleSelectApplication = useCallback(
    (id) => {
      if (id && leaves.some((app) => app.id === id)) {
        setSelectedId(id);
      }
    },
    [leaves]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <FancyLoader />
      </div>
    );
  }

  // Error state (assuming useLeaveData returns error)
  if (error) {
    return (
      <div className="p-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] mb-5">
          Leave approval
        </p>
        <div className="flex flex-col items-center justify-center h-[75vh] rounded-lg bg-red-50 border border-red-100">
          <p className="text-red-600 font-medium mb-2">
            Failed to load applications
          </p>
          <p className="text-gray-500 text-sm">
            {error.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!leaves.length) {
    return (
      <div className="p-6">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] mb-5">
          Leave approval
        </p>
        <div className="flex flex-col items-center justify-center h-[75vh] rounded-lg ">
          <p className="text-gray-500 mb-2">No leave applications found</p>
          <p className="text-gray-400 text-sm">
            All applications have been processed
          </p>
        </div>
      </div>
    );
  }

  // Ensure we have a selected application
  const hasSelectedApplication = selectedApplication && selectedId;

  return (
    <div className="p-6">
      <p className="text-[22px] font-[600] capitalize font-poppins-regular text-[#1F1F1F] mb-5">
        Leave approval
      </p>
      <div className="h-[75vh] flex gap-4">
        <LeaveApplicationsList
          applications={leaves}
          selectedId={selectedId}
          onSelect={handleSelectApplication}
        />
        {hasSelectedApplication ? (
          <LeaveApplicationDetails
            data={selectedApplication}
            key={selectedId} // Re-mount on selection change
          />
        ) : (
          <div className="flex-1 flex items-center justify-center rounded-lg ">
            <p className="text-gray-500">
              Select an application to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalPage;
