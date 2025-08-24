import { useState, useMemo } from "react";
import { useTaskReportData } from "@/hook/useTaskReportData";
import CustomPagination from "../CustomPagination";
import TaskCard from "./TaskCard";

const ITEMS_PER_PAGE = 3;

export default function TodaysTaskReports() {
  const [currentPage, setCurrentPage] = useState(1);
  const { tasksReport, getTasksReport } = useTaskReportData();

  const todayStr = new Date().toLocaleDateString("en-CA");

  const todaysTasks = useMemo(() => {
    if (!Array.isArray(tasksReport)) return [];

    return tasksReport.filter((t) => {
      const createdDate = new Date(t.createdTime).toLocaleDateString("en-CA");
      return createdDate === todayStr;
    });
  }, [tasksReport, todayStr]);

  const totalPages = Math.ceil(todaysTasks.length / ITEMS_PER_PAGE);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return todaysTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, todaysTasks]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border mb-8 w-[75vw] ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedTasks.map((task, idx) => (
          <TaskCard key={idx} {...task} fn={getTasksReport} />
        ))}
      </div>

      <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-500">
        <CustomPagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
