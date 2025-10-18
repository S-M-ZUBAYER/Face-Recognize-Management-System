import React, { useState } from "react";

const EditEmployeeDetails = () => {
  const [employeeData, setEmployeeData] = useState({
    employeeId: "Tob842",
    joiningDate: "01 February 2023",
    monthlySalary: "000000",
    designation: "Product Designer",
    contactNumber: "+8900743830062",
    shift: "Morning",
    payPeriod: "Monthly",
    employeeName: "Mid Goldam Rabbani Pina",
    address: "Nilphamari",
    department: "Research & Development",
    email: "design.magphas@gmail.com",
    deviceName: "IFDI-E33...",
    addedBy: "Mid G R Pias",
    employeeImage: "https://i.pravatar.cc/150?img=20",
  });

  const handleInputChange = (field, value) => {
    setEmployeeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving employee data:", employeeData);
  };

  const handleCancel = () => {
    console.log("Canceling edits");
  };

  const inputFields = [
    { key: "employeeId", label: "Employee ID", colSpan: 1 },
    { key: "employeeName", label: "Employee Name", colSpan: 1 },
    { key: "joiningDate", label: "Joining Date", colSpan: 1 },
    { key: "address", label: "Address", colSpan: 1 },
    { key: "monthlySalary", label: "Monthly Salary", colSpan: 1 },
    { key: "department", label: "Department", colSpan: 1 },
    { key: "designation", label: "Designation", colSpan: 1 },
    { key: "email", label: "Email", colSpan: 1 },
    { key: "contactNumber", label: "Contact Number", colSpan: 1 },
    { key: "deviceName", label: "Device Name", colSpan: 1 },
    { key: "shift", label: "Shift", colSpan: 1 },
    { key: "addedBy", label: "Added By", colSpan: 1 },
  ];

  const DropdownField = ({ label, value }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between">
        <p className="text-gray-600">{value}</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
        >
          <path
            d="M6.75004 4.5C6.75004 4.5 11.25 7.81417 11.25 9C11.25 10.1859 6.75 13.5 6.75 13.5"
            stroke="#004368"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mx-auto">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Edit Employee Details
          </h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/5 flex flex-col items-center">
              <div className="w-50 h-50 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center mb-4">
                {employeeData?.employeeImage ? (
                  <img
                    src={employeeData.employeeImage}
                    alt="Employee"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">No Image</span>
                )}
              </div>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputFields.map((field) => (
                <div
                  key={field.key}
                  className={field.colSpan === 2 ? "md:col-span-2" : ""}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={employeeData[field.key]}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              ))}

              <DropdownField label="Pay Period" value="monthly" />
              <DropdownField label="Rules" value="rules" />

              <div className="md:col-span-2 flex justify-end space-x-3 mt-5">
                <button
                  onClick={handleCancel}
                  className="px-15 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-15 py-2 bg-[#004368] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeDetails;
