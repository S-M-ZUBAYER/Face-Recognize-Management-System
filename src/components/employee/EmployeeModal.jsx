import React from "react";

const EmployeeModal = ({ selectedEmp, setSelectedEmp }) => {
  console.log(selectedEmp);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      {/* Modal box */}
      <div className="relative bg-white rounded-2xl shadow-xl w-[90vw] max-w-2xl p-6 z-10 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
          Employee Details
        </h2>
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <p>
            <strong>Name:</strong> {selectedEmp?.name?.split("<")[0]}
          </p>
          <p>
            <strong>Email:</strong> {selectedEmp?.email}
          </p>
          <p>
            <strong>Employee ID:</strong> {selectedEmp?.companyEmployeeId}
          </p>
          <p>
            <strong>Department:</strong> {selectedEmp?.department}
          </p>
          <p>
            <strong>Designation:</strong> {selectedEmp?.designation}
          </p>
          <p>
            <strong>Device MAC:</strong> {selectedEmp?.deviceMAC}
          </p>
          <p>
            <strong>Shift:</strong> {selectedEmp?.payPeriod?.shift}
          </p>
          <p>
            <strong>Pay Period:</strong> {selectedEmp?.payPeriod?.payPeriod}
          </p>
        </div>
        {/* totalPay, overtimeDetails */}
        {/* Salary Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 border-t pt-4">
          <p>
            <strong>Salary:</strong> {selectedEmp.payPeriod.salary}
          </p>
          <p>
            <strong>Hourly Rate:</strong>{" "}
            {selectedEmp.payPeriod?.overtimeSalary}
          </p>
          <p>
            <strong>Shift:</strong> {selectedEmp.payPeriod?.shift}
          </p>
        </div>
        {/* Attendance Stats */}

        {/* Close button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setSelectedEmp(null)}
            className="px-4 py-2 bg-[#004368] text-white rounded-lg shadow  transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
