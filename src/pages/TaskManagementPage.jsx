import { useState } from "react";
import TaskMonthPicker from "@/components/taskManagement/TaskMonthPicker";
import { useDesignation } from "@/hook/useDesignation";
import EmployeeFilterTabs from "@/components/EmployeeFilterTabs";
import TaskCard from "@/components/taskManagement/TaskCard";
import { Button } from "@/components/ui/button";

const task = [
  {
    id: 1,
    employeeName: "John Doe",
    reportDetails: [
      "Completed the monthly report.",
      "Attended team meeting",
      "Reviewed project proposals",
      "Updated client on project status",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=1",
    date: "2023-10-01",
  },
  {
    id: 2,
    employeeName: "Jane Smith",
    reportDetails: [
      "Conducted market research",
      "Developed marketing strategy",
      "Coordinated with design team",
      "Analyzed campaign performance",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=2",
    date: "2023-10-02",
  },
  {
    id: 3,
    employeeName: "Alice Johnson",
    reportDetails: [
      "Designed new website layout",
      "Created wireframes",
      "Collaborated with developers",
      "Tested website functionality",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=3",
    date: "2023-10-03",
  },
  {
    id: 4,
    employeeName: "John Doe",
    reportDetails: [
      "Completed the monthly report.",
      "Attended team meeting",
      "Reviewed project proposals",
      "Updated client on project status",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=4",
    date: "2023-10-01",
  },
  {
    id: 5,
    employeeName: "Jane Smith",
    reportDetails: [
      "Conducted market research",
      "Developed marketing strategy",
      "Coordinated with design team",
      "Analyzed campaign performance",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=5",
    date: "2023-10-02",
  },
  {
    id: 6,
    employeeName: "Alice Johnson",
    reportDetails: [
      "Designed new website layout",
      "Created wireframes",
      "Collaborated with developers",
      "Tested website functionality",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=6",
    date: "2023-10-03",
  },
  {
    id: 7,
    employeeName: "John Doe",
    reportDetails: [
      "Completed the monthly report.",
      "Attended team meeting",
      "Reviewed project proposals",
      "Updated client on project status",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=7",
    date: "2023-10-01",
  },
  {
    id: 8,
    employeeName: "Jane Smith",
    reportDetails: [
      "Conducted market research",
      "Developed marketing strategy",
      "Coordinated with design team",
      "Analyzed campaign performance",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=8",
    date: "2023-10-02",
  },
  {
    id: 9,
    employeeName: "Alice Johnson",
    reportDetails: [
      "Designed new website layout",
      "Created wireframes",
      "Collaborated with developers",
      "Tested website functionality",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=9",
    date: "2023-10-03",
  },
  {
    id: 10,
    employeeName: "John Doe",
    reportDetails: [
      "Completed the monthly report.",
      "Attended team meeting",
      "Reviewed project proposals",
      "Updated client on project status",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=10",
    date: "2023-10-01",
  },
  {
    id: 11,
    employeeName: "Jane Smith",
    reportDetails: [
      "Conducted market research",
      "Developed marketing strategy",
      "Coordinated with design team",
      "Analyzed campaign performance",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=11",
    date: "2023-10-02",
  },
  {
    id: 12,
    employeeName: "Alice Johnson",
    reportDetails: [
      "Designed new website layout",
      "Created wireframes",
      "Collaborated with developers",
      "Tested website functionality",
    ],
    employeeImage: "https://i.pravatar.cc/150?img=12",
    date: "2023-10-03",
  },
];

function TaskManagementPage() {
  const [activeFilter, setActiveFilter] = useState("All Employees");
  const { designation } = useDesignation();
  const getFilteredTasks = () => {
    if (activeFilter === "All Employees") return task;
    return task.filter((emp) => emp.department === activeFilter);
  };
  return (
    <div>
      <div className="flex justify-between items-center border-b pb-4 mb-4 border-[#D9E3E8]">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F]">
          Task management
        </p>
        <div className="flex items-center gap-4">
          <TaskMonthPicker />
        </div>
      </div>
      <EmployeeFilterTabs
        filters={designation}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className="mt-6 h-[65vh] overflow-y-auto custom-scrollbar px-1.5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredTasks().map((task, idx) => (
            <TaskCard key={idx} {...task} />
          ))}
        </div>
      </div>
      <div className="text-right">
        <Button className="mt-4 bg-[#004368] hover:bg-[#004368]  text-white font-poppins-regular px-[6vw] py-[2vh] ">
          Add Task
        </Button>
      </div>
    </div>
  );
}

export default TaskManagementPage;
