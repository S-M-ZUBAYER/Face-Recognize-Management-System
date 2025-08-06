import React from "react";

function DailyActivities() {
  const activities = [
    { message: "New user created in developer team", time: "09:05am" },
    { message: "New Task assign to development team", time: "09:05am" },
    { message: "Feature request reviewed by product manager", time: "09:15am" },
    { message: "Code review completed for module X", time: "09:20am" },
    { message: "Meeting scheduled with stakeholders", time: "09:30am" },
    { message: "Deployment of version 1.2 initiated", time: "09:45am" },
    { message: "User feedback collected from beta testers", time: "10:00am" },
    { message: "Sprint planning session started", time: "10:15am" },
    { message: "Bug fix patch released for urgent issues", time: "10:30am" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] ">
      <h3 className="font-semibold text-lg mb-8">Daily Activities</h3>
      <ul className="space-y-[10px]">
        {activities.map((item, idx) => (
          <li
            key={idx}
            className="flex justify-between text-sm text-gray-700 border-b border-[#E0E0E0] pb-[10px]"
          >
            <span>{item.message}</span>
            <span className="text-gray-400">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DailyActivities;
