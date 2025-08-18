import { useState } from "react";
import AttendanceFilters from "./AttendanceFilters ";
import AttendanceTable from "./AttendanceTable";

const EmployeeAttendance = () => {
  const mockAttendedEmployees = [
    {
      employeeId: "TG0642",
      name: "Md Golam Rabbani Pias",
      designation: "Product Designer",
      department: "Software Development",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      employeeId: "TG0643",
      name: "Aisha Khan",
      designation: "Frontend Developer",
      department: "Software Development",
      workHour: "8 Hours",
      overtime: "Yes",
    },
    {
      employeeId: "TG0644",
      name: "Kenji Tanaka",
      designation: "UX Researcher",
      department: "Design",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      employeeId: "TG0645",
      name: "Maria Garcia",
      designation: "QA Engineer",
      department: "Quality Assurance",
      workHour: "8 Hours",
      overtime: "Yes",
    },
    {
      employeeId: "TG0646",
      name: "David Chen",
      designation: "DevOps Engineer",
      department: "Operations",
      workHour: "8 Hours",
      overtime: "Yes",
    },
    {
      employeeId: "TG0647",
      name: "Fatima Al-Sayed",
      designation: "Scrum Master",
      department: "Project Management",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      employeeId: "TG0648",
      name: "Alejandro Rojas",
      designation: "Backend Developer",
      department: "Software Development",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      employeeId: "TG0649",
      name: "Chidinma Okoro",
      designation: "Data Scientist",
      department: "Data & Analytics",
      workHour: "6 Hours",
      overtime: "No",
    },
    {
      employeeId: "TG0650",
      name: "Liam Murphy",
      designation: "Technical Writer",
      department: "Documentation",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      employeeId: "TG0651",
      name: "Sofia Petrova",
      designation: "UI Designer",
      department: "Design",
      workHour: "8 Hours",
      overtime: "Yes",
    },
    {
      employeeId: "TG0652",
      name: "Arjun Singh",
      designation: "IT Support Specialist",
      department: "Information Technology",
      workHour: "8 Hours",
      overtime: "Yes",
    },
  ];

  const mockAbsentEmployees = [
    {
      employeeId: "TG0653",
      name: "Emma Thompson",
      designation: "Marketing Manager",
      department: "Marketing",
      workHour: "8 Hours",
      overtime: "No",
    },
    {
      employeeId: "TG0654",
      name: "Ahmed Hassan",
      designation: "Sales Representative",
      department: "Sales",
      workHour: "8 Hours",
      overtime: "No",
    },
  ];

  // Replace this with your actual hook
  // const { attendedEmployees, absentEmployees, selectedDate, setSelectedDate } = useEmployeeData();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeFilter, setActiveFilter] = useState("present");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Get current employees based on filter
  const getCurrentEmployees = () => {
    switch (activeFilter) {
      case "present":
        return mockAttendedEmployees;
      case "absent":
        return mockAbsentEmployees;
      case "overtime":
        return mockAttendedEmployees.filter((emp) => emp.overtime === "Yes");
      default:
        return [];
    }
  };

  const currentEmployees = getCurrentEmployees();

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(currentEmployees.map((emp) => emp.employeeId));
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

  // Filter change handler
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setSelectedEmployees([]); // Clear selection when changing filter
    setCurrentPage(1); // Reset to first page
  };

  // Export handler
  const handleExport = () => {
    console.log("Exporting attendance data for:", activeFilter);
    console.log("Selected employees:", selectedEmployees);
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* <AttendanceHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        /> */}

        <AttendanceFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          attendedCount={mockAttendedEmployees.length}
          absentCount={mockAbsentEmployees.length}
        />

        {/* Select All Checkbox */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={
              selectedEmployees.length === currentEmployees.length &&
              currentEmployees.length > 0
            }
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  selectedEmployees.length > 0 &&
                  selectedEmployees.length < currentEmployees.length;
              }
            }}
            onChange={handleSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Select All</span>
        </div>

        <AttendanceTable
          employees={currentEmployees}
          selectedEmployees={selectedEmployees}
          onSelectAll={handleSelectAll}
          onSelectEmployee={handleSelectEmployee}
          showOvertime={activeFilter !== "absent"}
        />

        {/* <AttendanceFooter
          currentPage={currentPage}
          totalPages={4}
          onPageChange={setCurrentPage}
          onExport={handleExport}
        /> */}
      </div>
    </div>
  );
};

export default EmployeeAttendance;
