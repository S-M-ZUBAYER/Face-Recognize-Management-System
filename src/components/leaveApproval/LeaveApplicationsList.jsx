import React, { useMemo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LeaveApplicationsList = ({ applications = [], selectedId, onSelect }) => {
  // Memoize the getInitials function to prevent recreation on each render
  const getInitials = useCallback((name) => {
    if (!name) return "??";
    return (
      name
        .split(" ")
        .map((n) => (n && n[0] ? n[0] : ""))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"
    );
  }, []);

  // Memoize the status color function
  const getStatusColor = useCallback((status) => {
    if (!status) return "text-gray-600";

    if (status.includes("pending_leader") || status.includes("pending_admin")) {
      return "text-yellow-600";
    }

    if (
      status.includes("rejected_admin") ||
      status.includes("rejected_leader")
    ) {
      return "text-red-600";
    }

    return "text-green-600";
  }, []);

  // Memoize the employee name extraction
  const getEmployeeName = useCallback((fullName) => {
    if (!fullName) return "Unknown";
    return fullName.split("<")[0];
  }, []);

  // Memoize filtered and sorted applications if needed
  const processedApplications = useMemo(() => {
    // Add any filtering or sorting logic here
    return applications.filter((app) => app && typeof app === "object");
  }, [applications]);

  // Handle application selection with validation
  const handleAppSelect = useCallback(
    (app) => {
      if (app?.id && typeof onSelect === "function") {
        onSelect(app.id);
      }
    },
    [onSelect]
  );

  if (!Array.isArray(applications) || applications.length === 0) {
    return (
      <div className="w-1/3 rounded-2xl border border-[#E6ECF0] p-4">
        <h2 className="text-lg font-semibold my-2 px-2">Leave Applications</h2>
        <div className="h-[calc(100%-3rem)] flex items-center justify-center">
          <p className="text-gray-500 text-sm">No applications available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/3 rounded-2xl border border-[#E6ECF0] p-4">
      <div className="flex justify-between items-center my-2 px-2">
        <h2 className="text-lg font-semibold">Leave Applications</h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {applications.length} total
        </span>
      </div>
      <div className="h-[calc(100%-3rem)] overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-2 pl-2.5 pr-1.5">
          {processedApplications.map((app) => {
            if (!app || !app.id) return null;

            const employeeName = getEmployeeName(app.employeeName);
            const initials = getInitials(employeeName);
            const isSelected = selectedId === app.id;

            return (
              <div
                key={app.id}
                onClick={() => handleAppSelect(app)}
                className={`flex items-center gap-3 px-3 py-2 rounded-[10px] cursor-pointer transition-all ${
                  isSelected
                    ? "border border-[#004368] bg-[#004368]/5"
                    : "border border-[#E6ECF0] hover:border-[#004368]/30 hover:bg-gray-50/50"
                }`}
                title={`${employeeName} - ${app.leaveCategory || "Leave"}`}
                aria-selected={isSelected}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAppSelect(app);
                  }
                }}
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage
                    src={app.employeeImage}
                    alt={`${employeeName}'s profile`}
                  />
                  <AvatarFallback className="text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {employeeName}
                  </p>
                  <div className="flex items-center gap-2">
                    {app.leaveCategory && (
                      <>
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
                          aria-hidden="true"
                        >
                          <circle cx="3" cy="3" r="3" fill="#D9D9D9" />
                        </svg>
                      </>
                    )}
                    {app.status && (
                      <span
                        className={`text-xs font-medium truncate ${getStatusColor(
                          app.status
                        )}`}
                        title={app.status}
                      >
                        {app.status.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-[#004368] flex-shrink-0 ml-auto" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(LeaveApplicationsList);
