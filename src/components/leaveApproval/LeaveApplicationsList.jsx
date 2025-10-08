import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LeaveApplicationsList = ({ applications, selectedId, onSelect }) => {
  return (
    <div className="w-1/3  rounded-2xl  border border-[#E6ECF0] p-4">
      <h2 className="text-lg font-semibold my-2">Leave Applications</h2>
      <div className="flex flex-col gap-2">
        {applications.map((app) => (
          <div
            key={app.id}
            onClick={() => onSelect(app.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-[10px] cursor-pointer transition-all ${
              selectedId === app.id
                ? " border border-[#004368] "
                : " border border-[#E6ECF0] "
            }`}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={`https://i.pravatar.cc/150?img=${app.id + 10}`}
                alt="@maxleiter"
              />
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <div className=" justify-between flex-col  ">
              <p className="font-semibold text-[1.4vh] text-gray-800">
                {app.name}
              </p>
              <div className="flex items-center gap-5">
                <p className="text-sm text-gray-500 text-[1.2vh]">
                  {app.category}
                </p>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="6"
                    height="6"
                    viewBox="0 0 6 6"
                    fill="none"
                  >
                    <circle cx="3" cy="3" r="3" fill="#D9D9D9" />
                  </svg>
                </div>
                <span
                  className={`text-xs font-medium text-[1.2vh] ${
                    app.status.includes("Pending")
                      ? "text-yellow-600"
                      : app.status.includes("Rejected")
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
  );
};

export default LeaveApplicationsList;
