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

function Dashboard() {
  const cards = [
    {
      title: "Total Employee",
      count: 1000,
      icon: <TotalEmployeeIcon className="text-xl text-blue-500" />,
    },
    {
      title: "Present",
      count: 990,
      icon: <PresentEmployeeIcon className="text-xl text-green-500" />,
    },
    {
      title: "Absent",
      count: 10,
      icon: <AbsentEmployeeIcon className="text-xl text-red-500" />,
    },
    {
      title: "Late Punch",
      count: 5,
      icon: <LatePunchIcon className="text-xl text-yellow-500" />,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Attendance Overview</h1>
        <DashboardDatePicker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <AttendanceCard
            key={idx}
            title={card.title}
            count={card.count}
            icon={card.icon}
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
