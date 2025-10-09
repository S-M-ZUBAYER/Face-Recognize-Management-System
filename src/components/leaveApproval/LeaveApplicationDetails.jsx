import React from "react";
import { FileText, ArrowLeft } from "lucide-react";

const LeaveApplicationDetails = ({ data }) => {
  if (!data) {
    return (
      <div className="w-2/3 rounded-2xl border border-gray-200 p-6 flex items-center justify-center">
        <p className="text-gray-500">Select an application to view details</p>
      </div>
    );
  }

  return (
    <div className="w-2/3 rounded-2xl border border-gray-200 p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <button className="inline-flex items-center gap-2 font-semibold rounded-lg  transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Application Details</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Approver Name */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Approver Name</p>
          <p className="text-sm text-gray-600">{data.approver}</p>
        </div>

        {/* Applicant Name */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Applicant Name</p>
          <p className="text-sm text-gray-600">{data.applicant}</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Description</p>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-[10vh] overflow-y-auto custom-scrollbar">
            <p className="text-sm text-gray-600 leading-relaxed">
              {data.description}
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

        {/* Attachment */}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">
            Attached Documents
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg w-[49%] ">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">{data.attachment}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4  border-gray-200">
          <button className="flex-1 px-6 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            Reject
          </button>
          <button className="flex-1 px-6 py-3 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationDetails;
