import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FancyLoader from "../FancyLoader";
import PayPeriodSettings from "./PayPeriodSettings";
import EditRules from "./EditRules";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

const EditEmployeeDetails = () => {
  const { id, deviceMac } = useParams();
  const { data, isLoading, isError, error } = useSingleEmployeeDetails(
    id,
    deviceMac
  );
  console.log(data);
  const { setSelectedEmployee } = useEmployeeStore();

  const [employeeData, setEmployeeData] = useState({
    employeeId: "",
    joiningDate: "",
    monthlySalary: "",
    designation: "",
    contactNumber: "",
    shift: "",
    payPeriod: "",
    employeeName: "",
    address: "",
    department: "",
    email: "",
    deviceName: "",
    addedBy: "",
    employeeImage: "",
  });

  // Initialize employee data when data is loaded
  useEffect(() => {
    if (data) {
      setEmployeeData({
        employeeId: data.employeeId || "",
        joiningDate: data.startDate || "",
        monthlySalary: data.payPeriod?.salary || "",
        designation: data.designation || "",
        contactNumber: data.contactNumber || "",
        shift: data.payPeriod?.shift || "",
        payPeriod: data.payPeriod?.payPeriod || "",
        employeeName: data.name?.split("<")[0] || "",
        address:
          typeof data.address === "string"
            ? (() => {
                try {
                  return JSON.parse(data.address).des || data.address;
                } catch {
                  return data.address;
                }
              })()
            : data.address?.des || "",
        department: data.department || "",
        email: data.email?.split("|")[0] || "",
        deviceName: data.deviceName || "",
        addedBy: data.addedBy || "",
        employeeImage: data.imageFile
          ? `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/media/${data.imageFile}`
          : "",
      });
      setSelectedEmployee(data);
    }
  }, [data, setSelectedEmployee]);

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
    { key: "shift", label: "Shift", colSpan: 1, show: 1 },
    { key: "addedBy", label: "Added By", colSpan: 1 },
  ];

  if (isLoading) {
    return <FancyLoader />;
  }

  if (isError) {
    return (
      <div className="w-full h-[75vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

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
                    value={employeeData[field.key] || ""}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value)
                    }
                    disabled={field.show === 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              ))}

              {/* <DropdownField
                label="Pay Period"
                value={employeeData.payPeriod || "monthly"}
              /> */}

              <PayPeriodSettings />
              <EditRules />

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
