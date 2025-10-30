import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LeaveApplicationsList = ({ applications, selectedId, onSelect }) => {
  return (
    <div className="w-1/3 rounded-2xl border border-[#E6ECF0] p-4">
      <h2 className="text-lg font-semibold my-2 px-2">Leave Applications</h2>
      <div className="h-[calc(100%-3rem)] overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-2 pl-2.5 pr-1.5">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => onSelect(app.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-[10px] cursor-pointer transition-all ${
                selectedId === app.id
                  ? "border border-[#004368]"
                  : "border border-[#E6ECF0]"
              }`}
            >
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage
                  src={
                    app.employeeImage ||
                    `https://i.pravatar.cc/150?img=${app.id}`
                  }
                  alt={app.name}
                />
                <AvatarFallback>
                  {app.employeeName

                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {app.employeeName}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 truncate">
                    {app.leaveCategory}
                  </p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="4"
                    height="4"
                    viewBox="0 0 6 6"
                    fill="none"
                    className="flex-shrink-0"
                  >
                    <circle cx="3" cy="3" r="3" fill="#D9D9D9" />
                  </svg>
                  <span
                    className={`text-xs font-medium ${
                      app.status.includes("pending_leader") ||
                      app.status.includes("pending_admin")
                        ? "text-yellow-600"
                        : app.status.includes("rejected_admin") ||
                          app.status.includes("rejected_leader")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationsList;
