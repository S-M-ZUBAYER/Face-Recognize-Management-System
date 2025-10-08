import React from "react";
import { FileText } from "lucide-react";

const LeaveApplicationDetails = ({ data }) => {
  if (!data) {
    return (
      <div className="w-2/3 rounded-2xl  border border-[#E6ECF0]  p-6 text-gray-500 flex items-center justify-center">
        Select an application to view details
      </div>
    );
  }

  return (
    <div className="w-2/3 rounded-2xl  border border-[#E6ECF0]  p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <button className=" justify-center items-center flex gap-2 btn btn-outline btn-sm rounded-md px-3 py-1">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3.99982 12H19.9998"
                stroke="#004368"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.9996 17C8.9996 17 3.99965 13.3176 3.99963 12C3.99962 10.6824 8.99963 7 8.99963 7"
                stroke="#004368"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <p>Application Details</p>
        </button>
      </h2>

      <div className="space-y-3 text-sm">
        <p>
          <span className="font-semibold">Approver Name:</span> {data.approver}
        </p>
        <p>
          <span className="font-semibold">Applicant Name:</span>{" "}
          {data.applicant}
        </p>

        <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
          <p className="text-gray-600 text-sm">{data.description}</p>
        </div>

        <p>
          <span className="font-semibold">Leave Category:</span>{" "}
          {data.leaveCategory}
        </p>
        <p>
          <span className="font-semibold">Leave Type:</span> {data.leaveType}
        </p>

        <div className="flex gap-10">
          <p>
            <span className="font-semibold">Leave Start Day:</span>{" "}
            {data.startDate}
          </p>
          <p>
            <span className="font-semibold">Leave End Day:</span> {data.endDate}
          </p>
        </div>

        <div>
          <p className="font-semibold mb-1">Attach Documents</p>
          <div className="flex items-center gap-2 bg-gray-50 border p-2 rounded-md w-fit">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">{data.attachment}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button className="btn btn-outline btn-error rounded-md px-5">
            Reject
          </button>
          <button className="btn btn-success text-white rounded-md px-5">
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationDetails;
