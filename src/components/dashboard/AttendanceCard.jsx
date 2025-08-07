import React, { useEffect, useState } from "react";
import CountUp from "react-countup";

function AttendanceCard({ title, count, icon, isLoading }) {
  const parsedValue = Number(String(count).replace(/[^0-9]/g, "")) || 0;
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoopKey((prev) => prev + 1);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl px-[22px] py-[36px] flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {isLoading ? (
            <CountUp
              key={loopKey}
              start={0}
              end={10000}
              duration={500}
              separator=","
            />
          ) : (
            <CountUp start={0} end={parsedValue} duration={1.5} separator="," />
          )}
        </h2>
        <p className="text-gray-500 text-[14px]">{title}</p>
      </div>
      <div className="bg-gray-100 p-2 rounded-full">{icon}</div>
    </div>
  );
}

export default AttendanceCard;
