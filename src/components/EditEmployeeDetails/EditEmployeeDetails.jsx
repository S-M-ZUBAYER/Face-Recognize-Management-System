import { useSingleEmployeeDetails } from "@/hook/useSingleEmployeeDetails";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FancyLoader from "../FancyLoader";
import PayPeriodSettings from "./PayPeriodSettings";
import EditRules from "./EditRules";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import toast from "react-hot-toast";
import getUpdatedName from "@/lib/getUpdatedName";
import parseAddress from "@/lib/parseAddress";

const EditEmployeeDetails = () => {
  const { id, deviceMac } = useParams();
  const { data, isLoading, isError, error, updateEmployee, updating } =
    useSingleEmployeeDetails(id, deviceMac);
  const { setSelectedEmployee } = useEmployeeStore();
  const navigate = useNavigate();

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
      const emailParts = data.email?.split("|") || [];
      setEmployeeData({
        employeeId: emailParts[1] || "",
        joiningDate: data.startDate || "",
        monthlySalary: data.payPeriod?.salary || "",
        designation: data.designation || "",
        contactNumber: data.contactNumber || "",
        shift: data.payPeriod?.shift || "",
        payPeriod: data.payPeriod?.payPeriod || "",
        employeeName: data.name?.split("<")[0] || "",
        address: parseAddress(data.address)?.des,
        department: data.department || "",
        email: emailParts[0] || "",
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

  const handleSave = async () => {
    let addressPayload = "";

    try {
      const parsed = JSON.parse(data.address);
      addressPayload = JSON.stringify({
        ...parsed,
        des: employeeData.address,
      });
    } catch {
      addressPayload = employeeData.address;
    }

    try {
      const payload = {
        name: getUpdatedName(data.name, employeeData.employeeName),
        startDate: employeeData.joiningDate,
        address: addressPayload,
        designation: employeeData.designation,
        contactNumber: employeeData.contactNumber,
        department: employeeData.department,
        email: `${employeeData.email}|${employeeData.employeeId}`,
      };

      await updateEmployee({
        mac: deviceMac || "",
        id: id,
        payload: payload,
      });
      toast.success("Employee details updated successfully!");
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee details.");
    }
  };

  const handleCancel = () => {
    if (data) {
      const emailParts = data.email?.split("|") || [];
      setEmployeeData({
        employeeId: emailParts[1] || "",
        joiningDate: data.startDate || "",
        monthlySalary: data.payPeriod?.salary || "",
        designation: data.designation || "",
        contactNumber: data.contactNumber || "",
        shift: data.payPeriod?.shift || "",
        payPeriod: data.payPeriod?.payPeriod || "",
        employeeName: data.name?.split("<")[0] || "",
        address: parseAddress(data.address),
        department: data.department || "",
        email: emailParts[0] || "",
        deviceName: data.deviceName || "",
        addedBy: data.addedBy || "",
        employeeImage: data.imageFile
          ? `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/media/${data.imageFile}`
          : "",
      });
    }
    toast.success("Changes cancelled.");
  };

  const inputFields = [
    { key: "employeeId", label: "Employee ID", colSpan: 1, disabled: false },
    {
      key: "employeeName",
      label: "Employee Name",
      colSpan: 1,
      disabled: false,
    },
    { key: "joiningDate", label: "Joining Date", colSpan: 1, disabled: false },
    { key: "address", label: "Address", colSpan: 1, disabled: false },
    {
      key: "monthlySalary",
      label: "Monthly Salary",
      colSpan: 1,
      disabled: true,
    },
    { key: "department", label: "Department", colSpan: 1, disabled: false },
    { key: "designation", label: "Designation", colSpan: 1, disabled: false },
    { key: "email", label: "Email", colSpan: 1, disabled: false },
    {
      key: "contactNumber",
      label: "Contact Number",
      colSpan: 1,
      disabled: false,
    },
    { key: "deviceName", label: "Device Name", colSpan: 1, disabled: true },
    { key: "shift", label: "Shift", colSpan: 1, disabled: true },
    { key: "addedBy", label: "Added By", colSpan: 1, disabled: true },
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
        <div className="px-6 py-4 flex  gap-3.5 items-center">
          <div
            onClick={() => {
              navigate("/employee-management");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M15 18C15 18 9 13.5811 9 12C9 10.4188 15 6 15 6"
                stroke="#272727"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
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
                    disabled={field.disabled}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      field.disabled ? "cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>
              ))}

              <PayPeriodSettings selectedPayPeriod={employeeData.payPeriod} />
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
                  disabled={updating}
                  className="px-15 py-2 bg-[#004368] text-white rounded-md  focus:outline-none focus:ring-2 focus:ring-offset-2  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Saving..." : "Save"}
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
