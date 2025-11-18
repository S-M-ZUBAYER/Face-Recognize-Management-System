import React from "react";
import { FileText, ArrowLeft, Download } from "lucide-react";
import { useLeaveData } from "@/hook/useLeaveData";
import { useUserData } from "@/hook/useUserData";
import toast from "react-hot-toast";
import updateJsonString from "@/lib/updateJsonString";

const LeaveApplicationDetails = ({ data }) => {
  const { updateLeave } = useLeaveData();
  const { user } = useUserData();

  if (!data) {
    return (
      <div className="w-2/3 rounded-2xl border border-gray-200 p-6 flex items-center justify-center">
        <p className="text-gray-500">Select an application to view details</p>
      </div>
    );
  }

  const handleUpdateLeave = async (status) => {
    // let approverName;
    // let updateStatus;
    // if (data.status === "pending_admin") {
    //   approverName = updateJsonString("admin", user?.userName);
    //   updateStatus = `${status}_admin`;
    // } else if (data.status === "pending_leader") {
    //   approverName = updateJsonString("admin", user?.userName);
    //   // approverName = updateJsonString("leader", user?.userName);
    //   updateStatus = `${status}_leader`;
    // }

    try {
      // console.log(objectToEscapedJsonString(data.description));
      // console.log(updateJsonString("admin", user?.userName));
      const updatedData = {
        id: data.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        approverName: updateJsonString("admin", user?.userName),
        deviceMAC: data.deviceMAC,
        startDate: data.startDate,
        endDate: data.endDate,
        description: JSON.stringify(data.description),
        leaveCategory: data.leaveCategory,
        leaveType: data.leaveType,
        documentUrl: data.documentUrl,
        status: `${status}_admin`,
      };
      console.log(updatedData);
      await updateLeave(updatedData);
      toast.success("Leave updated successfully");
    } catch (error) {
      toast.error("Leave update failed");
      console.error("Failed to update leave:", error);
    }
  };

  const handleReject = () => handleUpdateLeave("rejected");
  const handleApprove = () => handleUpdateLeave("approved");

  // File download function
  const handleDownload = () => {
    if (!data.documentUrl) {
      toast.error("No document available for download");
      return;
    }

    try {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = data.documentUrl;

      // Extract filename from URL or use a default name
      const fileName = data.documentUrl.split("/").pop() || "document";
      link.download = fileName;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed");
    }
  };

  const getApproverName = () => {
    if (typeof data.approverName === "object") {
      return (
        data.approverName.admin || data.approverName.leader || "No approver"
      );
    }
    return data.approverName || "No approver";
  };

  const getDescription = () => {
    if (typeof data.description === "object") {
      return data.description.des || "No description";
    }
    return data.description || "No description";
  };

  return (
    <div className="w-2/3 rounded-2xl border border-gray-200 p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <button className="inline-flex items-center gap-2 font-semibold rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Application Details</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Approver Name */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Approver Name</p>
          <p className="text-sm text-gray-600">{getApproverName()}</p>
        </div>

        {/* Applicant Name */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Applicant Name</p>
          <p className="text-sm text-gray-600">
            {data.employeeName.split("<")[0]}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Description</p>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-[10vh] overflow-y-auto custom-scrollbar">
            <p className="text-sm text-gray-600 leading-relaxed">
              {getDescription()}
            </p>
          </div>
        </div>

        {/* Leave Category */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Leave Category</p>
          <p className="text-sm text-gray-600">{data.leaveCategory}</p>
        </div>

        {/* Leave Type */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Leave Type</p>
          <p className="text-sm text-gray-600">{data.leaveType}</p>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              Leave Start Day
            </p>
            <p className="text-sm text-gray-600">{data.startDate}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Leave End Day</p>
            <p className="text-sm text-gray-600">{data.endDate}</p>
          </div>
        </div>

        {/* Attachment with Download */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">
            Attached Documents
          </p>
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg w-full ${
              data.documentUrl
                ? "cursor-pointer hover:bg-gray-100 transition-colors"
                : ""
            }`}
            onClick={data.documentUrl ? handleDownload : undefined}
          >
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700 flex-1">
              {data.documentUrl || "No document attached"}
            </span>
            {data.documentUrl && <Download className="w-4 h-4 text-blue-600" />}
          </div>
          {data.documentUrl && (
            <p className="text-xs text-gray-500">
              Click to download the document
            </p>
          )}
        </div>

        {/* Action Buttons - Conditionally rendered */}
        {(data.status === "pending_leader" ||
          data.status === "pending_admin") && (
          <div className="flex gap-4 border-gray-200">
            <button
              className="flex-1 px-6 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              onClick={handleReject}
            >
              Reject
            </button>
            <button
              className="flex-1 px-6 py-3 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              onClick={handleApprove}
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApplicationDetails;
