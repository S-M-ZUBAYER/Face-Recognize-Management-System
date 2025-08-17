import React, { useState } from "react";
import { Settings, Search, Download, Save, MoreHorizontal } from "lucide-react";

const EmployeeManagementTable = () => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Employees");

  const employees = [
    {
      id: "TG0642",
      name: "Md Golam Rabbani Pias",
      designation: "Product Designer",
      department: "Software Development",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      id: "TG0643",
      name: "Priya Sharma",
      designation: "Frontend Developer",
      department: "Software Development",
      workHour: "8 Hours",
      overtime: "Yes",
    },
    {
      id: "TG0644",
      name: "John Smith",
      designation: "QA Engineer",
      department: "Quality Assurance",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      id: "TG0645",
      name: "Chen Wei",
      designation: "Lead Backend Engineer",
      department: "Software Development",
      workHour: "9 Hours",
      overtime: "No",
    },
    {
      id: "TG0646",
      name: "Anja Schmidt",
      designation: "UX/UI Designer",
      department: "Design",
      workHour: "8 Hours",
      overtime: "Yes",
    },
    {
      id: "TG0647",
      name: "Fatima Al-Sayed",
      designation: "Project Manager",
      department: "Project Management",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      id: "TG0648",
      name: "Carlos Rodriguez",
      designation: "Data Scientist",
      department: "Data & Analytics",
      workHour: "8 Hours",
      overtime: "Yes",
    },
    {
      id: "TG0649",
      name: "Adebayo Adekunle",
      designation: "Cybersecurity Analyst",
      department: "IT & Security",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      id: "TG0650",
      name: "Kenji Tanaka",
      designation: "DevOps Engineer",
      department: "IT & Operations",
      workHour: "8 Hours",
      overtime: "Yes",
    },
    {
      id: "TG0651",
      name: "Olga Petrova",
      designation: "Content Strategist",
      department: "Marketing",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      id: "TG0652",
      name: "Marco Rossi",
      designation: "Business Analyst",
      department: "Business Development",
      workHour: "9 Hours",
      overtime: "Yes",
    },
    {
      id: "TG0653",
      name: "Lee Ji-Eun",
      designation: "Mobile Developer (iOS)",
      department: "Software Development",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      id: "TG0654",
      name: "Amélie Dubois",
      designation: "Cloud Architect",
      department: "IT & Operations",
      workHour: "8 Hours",
      overtime: "Yes",
    },
  ];

  const departments = [
    "All Employees",
    "Software Development",
    "Marketing",
    "Human Resources",
    "Sales",
    "Customer Support",
    "Finance",
    "Product Management",
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(employees.map((emp) => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const isAllSelected = selectedEmployees.length === employees.length;
  const isIndeterminate =
    selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Employee Management
          </h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Settings size={16} />
            Set Employee Rules
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveFilter(dept)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === dept
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {dept}
            </button>
          ))}
          <button className="px-3 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 p-4">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">
                    Employee ID
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">
                    Designation
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">
                    Department
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">
                    Work Hour
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">
                    Overtime
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">
                    Settings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleSelectEmployee(employee.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4 text-sm text-gray-900">
                      {employee.name}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{employee.id}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {employee.designation}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {employee.department}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {employee.workHour}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-sm ${
                          employee.overtime === "Yes"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {employee.overtime}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Previous</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded ${
                    page === 1
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <span>Next</span>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download size={16} />
              Export Excel
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagementTable;
