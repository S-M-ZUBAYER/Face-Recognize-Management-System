import React from "react";
import { QrCode, EllipsisVerticalIcon } from "lucide-react";

function EmployeeTable({ employees }) {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-xl">
      <table className="w-full text-left text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="p-3">Sl</th>
            <th className="p-3">Name</th>
            <th className="p-3">Employee ID</th>
            <th className="p-3">Designation</th>
            <th className="p-3">Department</th>
            <th className="p-3">Work Hour</th>
            <th className="p-3">QR Code</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-3">{String(idx + 1).padStart(2, "0")}</td>
              <td className="p-3">{emp.name}</td>
              <td className="p-3">{emp.empId}</td>
              <td className="p-3">{emp.designation}</td>
              <td className="p-3">{emp.department}</td>
              <td className="p-3">{emp.workHour}</td>
              <td className="p-3">
                <QrCode className="text-lg" />
              </td>
              <td className="p-3">
                <EllipsisVerticalIcon className="text-lg" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
