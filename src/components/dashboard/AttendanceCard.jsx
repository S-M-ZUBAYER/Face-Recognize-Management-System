import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";

function AttendanceCard({ title, count, icon, isLoading }) {
  const navigate = useNavigate();
  const parsedValue = Number(String(count || 0).replace(/[^0-9]/g, "")) || 0;
  const [loopKey, setLoopKey] = useState(0);
  const setActiveFilter = useAttendanceStore((state) => state.setActiveFilter);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoopKey((prev) => prev + 1);
      }, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  const handleRedirect = () => {
    try {
      if (title === "Total Employees") {
        setActiveFilter("all");
        navigate("/attendance");
      } else if (title === "Present") {
        setActiveFilter("present");
        navigate("/attendance");
      } else if (title === "Absent") {
        setActiveFilter("absent");
        navigate("/attendance");
      } else if (title === "Late Punch") {
        setActiveFilter("all");
        navigate("/attendance");
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div
      className="bg-white border border-[#E0E0E0] rounded-xl px-[22px] py-[36px] flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleRedirect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRedirect();
        }
      }}
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {isLoading ? (
            <CountUp
              key={loopKey}
              start={0}
              end={Math.floor(Math.random() * 1000) + 100} // Random loading animation
              duration={0.5}
              separator=","
            />
          ) : (
            <CountUp
              start={0}
              end={parsedValue}
              duration={1.5}
              separator=","
              preserveValue
            />
          )}
        </h2>
        <p className="text-gray-500 text-[14px]">{title}</p>
      </div>
      <div className="bg-gray-100 p-2 rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

export default AttendanceCard;
