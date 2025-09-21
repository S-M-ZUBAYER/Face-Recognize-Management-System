import React, { useMemo } from "react";
import { useDailyActivityData } from "@/hook/useDailyActivityData";

function DailyActivities() {
  const { dailyActivities, isLoading } = useDailyActivityData();

  const todayString = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");

  const todaysActivities = useMemo(() => {
    return dailyActivities.filter((item) =>
      item.createdAt?.startsWith(todayString)
    );
  }, [dailyActivities, todayString]);

  if (isLoading) return <p>Loading activities...</p>;

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] ">
      <h3 className="font-semibold text-lg mb-8">Daily Activities</h3>

      {todaysActivities.length === 0 ? (
        <p className="text-gray-500 text-sm">No activities today.</p>
      ) : (
        <ul className="space-y-[10px]">
          {todaysActivities.map((item, idx) => (
            <li
              key={idx}
              className="flex justify-between text-sm text-gray-700 border-b border-[#E0E0E0] pb-[10px]"
            >
              <span>{item.title}</span>
              <span className="text-gray-400">
                {item.createdAt.split(" ")[1]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DailyActivities;
