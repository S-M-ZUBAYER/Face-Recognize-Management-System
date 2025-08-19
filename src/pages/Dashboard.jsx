// pages/Dashboard.jsx
import React from "react";
import AttendanceCard from "../components/dashboard/AttendanceCard";
import DailyActivities from "../components/dashboard/DailyActivities";
import LeaveSummary from "../components/dashboard/LeaveSummary";
import DashboardDatePicker from "../components/dashboard/DashboardDatePicker";
import {
  TotalEmployeeIcon,
  PresentEmployeeIcon,
  AbsentEmployeeIcon,
  LatePunchIcon,
} from "../constants/icons";
import { useEmployeeData } from "@/hook/useEmployeeData";

function Dashboard() {
  const {
    totalEmployees,
    totalPresent,
    totalAbsent,
    totalLate,
    isLoading,
    employees,
    absentEmployees,
    attendedEmployees,
  } = useEmployeeData();

  console.log(
    "totalEmployees",
    totalEmployees,
    "totalPresent",
    totalPresent,
    "totalAbsent",
    totalAbsent,
    "totalLate",
    totalLate,
    employees,
    "Employees in Dashboard",
    absentEmployees,
    "Absent Employees",
    attendedEmployees,
    "Attended Employees"
  );
  const cards = [
    {
      title: "Total Employee",
      count: totalEmployees,
      icon: <TotalEmployeeIcon className="text-xl text-blue-500" />,
    },
    {
      title: "Present",
      count: totalPresent,
      icon: <PresentEmployeeIcon className="text-xl text-green-500" />,
    },
    {
      title: "Absent",
      count: totalAbsent,
      icon: <AbsentEmployeeIcon className="text-xl text-red-500" />,
    },
    {
      title: "Late Punch",
      count: totalLate,
      icon: <LatePunchIcon className="text-xl text-yellow-500" />,
    },
  ];
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-[22px] font-[600] capitalize font-poppins-regular  text-[#1F1F1F] mb-5">
          Attendance Overview
        </p>
        <DashboardDatePicker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <AttendanceCard
            key={idx}
            title={card.title}
            count={card.count}
            icon={card.icon}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyActivities />
        <LeaveSummary />
      </div>
    </div>
  );
}

export default Dashboard;
