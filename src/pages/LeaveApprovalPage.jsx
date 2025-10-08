import React, { useState } from "react";
import LeaveApplicationsList from "@/components/leaveApproval/LeaveApplicationsList";
import LeaveApplicationDetails from "@/components/leaveApproval/LeaveApplicationDetails";

const leaveApplications = [
  {
    id: 1,
    name: "Amina Javed",
    category: "Sick Leave",
    status: "Pending Review",
    approver: "Devon Lane",
    applicant: "Mir Sultan",
    description:
      "Time off from work granted to an employee due to illness, injury, or medical appointments, allowing them to rest and recover without risking job security.",
    leaveCategory: "Sick",
    leaveType: "Full day",
    startDate: "01 April 2025",
    endDate: "04 April 2025",
    attachment: "prescription 1",
    attachmentType: "pdf",
  },
  {
    id: 2,
    name: "Rohit Verma",
    category: "Vacation Leave",
    status: "Rejected By HR",
  },
  {
    id: 3,
    name: "Lina Patel",
    category: "Personal Leave",
    status: "Approved By Director",
  },
];

const LeaveApprovalPage = () => {
  const [selectedId, setSelectedId] = useState(1);
  const selectedApplication = leaveApplications.find(
    (app) => app.id === selectedId
  );

  return (
    <div className="p-6  ">
      <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F] mb-5">
        Leave approval
      </p>
      <div className="h-[75vh] flex gap-4 ">
        <LeaveApplicationsList
          applications={leaveApplications}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <LeaveApplicationDetails data={selectedApplication} />
      </div>
    </div>
  );
};

export default LeaveApprovalPage;
