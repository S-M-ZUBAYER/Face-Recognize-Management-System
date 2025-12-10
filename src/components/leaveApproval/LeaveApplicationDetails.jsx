import React from "react";
// import { FileText, ArrowLeft, Download } from "lucide-react";
import { useLeaveData } from "@/hook/useLeaveData";
import { useUserData } from "@/hook/useUserData";
import toast from "react-hot-toast";
import updateJsonString from "@/lib/updateJsonString";
import {
  ArrowLeft,
  UserCircle2,
  User,
  FileText,
  Download,
  Calendar,
  CalendarDays,
  Clock,
  Tag,
  Paperclip,
  FileX,
  XCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

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
  // Helper functions for enhanced UI
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDayName = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
    });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

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
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      {/* Main Container with proper constraints */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="rounded-3xl border border-gray-100 p-6 bg-white shadow-lg shadow-gray-100/50 backdrop-blur-sm">
          {/* Header with fixed positioning on scroll if needed */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-2 mb-6">
            <span className="text-[1.4vh] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Application Details
            </span>
          </div>

          {/* Content with proper responsive layout */}
          <div className="space-y-8">
            {/* Two-column layout for basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Approver Name Card */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-[#004368]/5 to-white p-4 transition-all duration-300 hover:shadow-md hover:border-[#004368]/20 group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#004368]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <UserCircle2 className="w-3.5 h-3.5" />
                  APPROVER
                </p>
                <p className="text-base md:text-l[1.4vh] font-bold text-gray-800 group-hover:text-[#004368] transition-colors truncate">
                  {getApproverName()}
                </p>
              </div>

              {/* Applicant Name Card */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50/30 to-white p-4 transition-all duration-300 hover:shadow-md hover:border-emerald-200/50 group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-100/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  APPLICANT
                </p>
                <p className="text-base md:text-[1.4vh] font-bold text-gray-800 group-hover:text-gray-900 transition-colors truncate">
                  {data.employeeName.split("<")[0]}
                </p>
              </div>
            </div>

            {/* Description with fixed height */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Description
                </p>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#004368]/10 text-[#004368]">
                  Details
                </span>
              </div>
              <div className="relative">
                <div className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-br from-gray-50/50 to-white max-h-[150px] min-h-[100px] overflow-y-auto custom-scrollbar backdrop-blur-sm shadow-inner">
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {getDescription() || "No description provided"}
                  </p>
                </div>
                {/* Gradient fade effect at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl" />
              </div>
            </div>

            {/* Leave Details - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Leave Category */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#004368]/5 to-[#004368]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Tag className="w-4 h-4 md:w-5 md:h-5 text-[#004368]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider truncate">
                      Category
                    </p>
                    <p className="text-sm md:text-[1.4vh] font-bold text-gray-800 truncate">
                      {data.leaveCategory}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leave Type */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#004368]/5 to-[#004368]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#004368]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider truncate">
                      Type
                    </p>
                    <p className="text-sm md:text-[1.4vh] font-bold text-gray-800 truncate">
                      {data.leaveType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Duration - Only show if endDate is not null */}
              {data.endDate && (
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[1.2vh] font-semibold text-gray-500 uppercase tracking-wider truncate">
                        Duration
                      </p>
                      <p className="text-sm md:text-[1.4vh] font-bold text-gray-800">
                        {calculateDuration(data.startDate, data.endDate)} days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date Range - Conditional rendering based on endDate */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                {data.endDate ? "Leave Period" : "Leave Date"}
              </p>
              <div className="relative">
                {/* Timeline visualization - Only show if endDate exists */}
                {data.endDate && (
                  <div className="hidden md:flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200" />
                      <span className="text-xs font-medium text-gray-600">
                        Start
                      </span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 mx-4" />
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-gray-600">
                        End
                      </span>
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-200" />
                    </div>
                  </div>
                )}

                <div
                  className={`grid gap-4 ${
                    data.endDate ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {/* Start Date - Always shown */}
                  <div
                    className={`rounded-2xl border border-gray-100 bg-gradient-to-br from-green-50/30 to-white p-4 ${
                      !data.endDate ? "md:col-span-1" : ""
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {data.endDate ? "LEAVE START DAY" : "LEAVE DATE"}
                    </p>
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-[1.4vh] font-bold text-gray-800">
                          {formatDate(data.startDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getDayName(data.startDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* End Date - Only show if endDate exists */}
                  {data.endDate && (
                    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-purple-50/30 to-white p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        LEAVE END DAY
                      </p>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-[1.4vh] font-bold text-gray-800">
                            {formatDate(data.endDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getDayName(data.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Single day indicator */}
                {!data.endDate && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Single day leave</span>
                  </div>
                )}
              </div>
            </div>

            {/* Attachment - Fixed to prevent overflow */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  Attached Documents
                </p>
                {data.documentUrl && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#004368]/10 text-[#004368]">
                    Available
                  </span>
                )}
              </div>

              <div
                onClick={data.documentUrl ? handleDownload : undefined}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  data.documentUrl
                    ? "border-[#004368]/20 bg-gradient-to-br from-[#004368]/5 to-white hover:border-[#004368]/30 hover:shadow-lg hover:shadow-[#004368]/10 cursor-pointer active:scale-[0.98]"
                    : "border-gray-100 bg-gradient-to-br from-gray-50/50 to-white"
                }`}
              >
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        data.documentUrl
                          ? "bg-gradient-to-br from-[#004368]/10 to-[#004368]/5 group-hover:scale-110 transition-transform duration-300"
                          : "bg-gradient-to-br from-gray-100 to-gray-50"
                      }`}
                    >
                      {data.documentUrl ? (
                        <FileText className="w-6 h-6 text-[#004368]" />
                      ) : (
                        <FileX className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          data.documentUrl ? "text-gray-800" : "text-gray-500"
                        }`}
                      >
                        {data.documentUrl
                          ? data.documentUrl.split("/").pop()?.slice(0, 50) ||
                            "Document"
                          : "No document attached"}
                        {data.documentUrl &&
                        data.documentUrl.split("/").pop()?.length > 50
                          ? "..."
                          : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {data.documentUrl
                          ? "Click to download the document"
                          : "No attachment available"}
                      </p>
                    </div>

                    {data.documentUrl && (
                      <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#004368] to-[#003152] text-white text-sm font-medium group-hover:from-[#005580] group-hover:to-[#004368] transition-all">
                          <Download className="w-4 h-4" />
                          Download
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress animation for download */}
                {data.documentUrl && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#004368]/20 to-[#004368]/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#004368] to-[#003152] w-0 group-hover:w-full transition-all duration-500 ease-out" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          {(data.status === "pending_leader" ||
            data.status === "pending_admin") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 pt-6 mt-8 border-t border-gray-100"
            >
              <button
                onClick={handleReject}
                className="group relative px-6 py-3 text-sm font-semibold text-red-600 bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 transition-all duration-300 active:scale-[0.98] overflow-hidden sm:w-[50%]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
                </div>
              </button>

              <button
                onClick={handleApprove}
                className="group relative px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#004368] to-[#003152] rounded-2xl hover:from-[#005580] hover:to-[#004368] hover:shadow-xl hover:shadow-[#004368]/30 transition-all duration-300 active:scale-[0.98] overflow-hidden sm:w-[50%]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Approve</span>
                </div>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationDetails;
