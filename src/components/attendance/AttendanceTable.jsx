import React, {
  memo,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { AutoSizer, MultiGrid } from "react-virtualized";
import "react-virtualized/styles.css";
import AttendanceFilters from "./AttendanceFilters";
import DateRangePicker from "./DateRangePicker";
import AttendanceExport from "./AttendanceExport";
import { RefreshIcon } from "@/constants/icons";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useAttendanceData } from "@/hook/useAttendanceData";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmployees } from "@/hook/useEmployees";
import { useOverTimeData } from "@/hook/useOverTimeData";

// Memoized AttendanceExport to prevent unnecessary re-renders
const MemoizedAttendanceExport = memo(AttendanceExport);

// --- Memoized SearchBox Component ---
const SearchBox = memo(function SearchBox({
  searchInput,
  setSearchInput,
  handleSearch,
  handleReset,
  handleKeyDown,
  searchQuery,
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search by Date,ID, Name or Department..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-72 border rounded-md px-3 py-2 text-sm focus:outline-none border-[#004368] "
      />
      <button
        onClick={handleSearch}
        disabled={!searchInput.trim()}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          searchInput.trim()
            ? "bg-[#004368] text-white hover:bg-[#003155]"
            : "bg-[#004368] text-white cursor-not-allowed"
        }`}
      >
        Search
      </button>
      {searchQuery && (
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-400 text-white rounded-md text-sm hover:bg-gray-500 transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
});

const AttendanceTable = ({ employees = [] }) => {
  // Simple individual selectors - NO custom equality functions
  const isProcessing = useAttendanceStore((state) => state.isProcessing);
  const isFilterLoading = useAttendanceStore((state) => state.isFilterLoading);
  const activeFilter = useAttendanceStore((state) => state.activeFilter);

  // Date range from store
  const { startDate, endDate } = useDateRangeStore();

  // FIXED: Get isRefreshing from store and use the store's refresh function
  const isRefreshing = useAttendanceStore((state) => state.isRefreshing);
  const refreshAttendanceData = useAttendanceStore(
    (state) => state.refreshAttendanceData
  );

  // Get refetch functions for the refresh
  const { refresh, isFetching } = useAttendanceData();
  const { refetch: refetchEmployees } = useEmployees();
  const { refetch: refetchOverTime } = useOverTimeData();

  // Local state for table functionality
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs to track previous values for auto-unselect
  const prevActiveFilterRef = useRef(activeFilter);
  const prevStartDateRef = useRef(startDate);
  const prevEndDateRef = useRef(endDate);
  const prevSearchQueryRef = useRef("");

  // Auto-unselect effect when activeFilter, date range, or search changes
  useEffect(() => {
    const filterChanged = prevActiveFilterRef.current !== activeFilter;
    const dateChanged =
      prevStartDateRef.current !== startDate ||
      prevEndDateRef.current !== endDate;
    const searchChanged = prevSearchQueryRef.current !== searchQuery;

    if (filterChanged || dateChanged || searchChanged) {
      if (selectedEmployees.length > 0) {
        console.log(
          "🔄 Auto-unselecting employees due to filter/date/search change"
        );
        setSelectedEmployees([]);
      }
    }

    // Update refs
    prevActiveFilterRef.current = activeFilter;
    prevStartDateRef.current = startDate;
    prevEndDateRef.current = endDate;
    prevSearchQueryRef.current = searchQuery;
  }, [activeFilter, startDate, endDate, searchQuery, selectedEmployees.length]);

  const handleSearch = useCallback(() => {
    if (searchInput.trim()) {
      setIsSearching(true);
      setSearchQuery(searchInput.trim());
      setTimeout(() => setIsSearching(false), 200);
    }
  }, [searchInput]);

  const handleReset = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
  }, []);

  // FIXED: Proper refresh function
  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh initiated from table");

    try {
      // Use the store's refresh function with proper refetch callbacks
      const success = await refreshAttendanceData({
        refetchEmployees: refetchEmployees,
        refetchAttendance: refresh,
        refetchOverTime: refetchOverTime,
      });

      if (success) {
        console.log("✅ Table refresh completed successfully");
      } else {
        console.error("❌ Table refresh failed");
      }
    } catch (error) {
      console.error("❌ Table refresh error:", error);
    }
  }, [refreshAttendanceData, refetchEmployees, refresh, refetchOverTime]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  // Filter employees based on search query
  // In AttendanceTable.jsx - ADD these useMemo hooks

  // Optimize filtered data calculation
  const filteredData = useMemo(() => {
    if (!searchQuery) return employees;
    const q = searchQuery.toLowerCase();

    return employees.filter((emp) => {
      const date = (emp?.punch?.date ?? "").toLowerCase();
      const name = (emp?.name ?? "").split("<")[0].toLowerCase();
      const empId = (emp?.companyEmployeeId ?? emp?.employeeId ?? emp?.id ?? "")
        .toString()
        .toLowerCase();
      const department = (emp?.department ?? "").toLowerCase();

      return (
        date.includes(q) ||
        name.includes(q) ||
        empId.includes(q) ||
        department.includes(q)
      );
    });
  }, [employees, searchQuery]);

  // Optimize max punch count calculation
  const maxPunchCount = useMemo(() => {
    if (!employees.length) return 1;

    let max = 1;
    for (let i = 0; i < employees.length; i++) {
      const checkIn = employees[i]?.punch?.checkIn;
      if (Array.isArray(checkIn)) {
        max = Math.max(max, checkIn.length);
      } else if (checkIn) {
        max = Math.max(max, 1);
      }
    }
    return max;
  }, [employees]);

  // // Optimize selected employee data
  // const selectedEmployeeData = useMemo(() => {
  //   const selectedSet = new Set(selectedEmployees);
  //   return employees.filter((emp) => {
  //     const id = emp.companyEmployeeId || emp.employeeId || emp.id;
  //     return selectedSet.has(id);
  //   });
  // }, [employees, selectedEmployees]);

  // Column definitions
  const columns = useMemo(() => {
    const selectColumn = { label: "", width: 56, key: "select" };
    const base = [
      { label: "Date", width: 140, key: "date" },
      { label: "Name", width: 260, key: "name" },
      { label: "Employee ID", width: 160, key: "employeeId" },
      { label: "Designation", width: 200, key: "designation" },
      { label: "Department", width: 200, key: "department" },
    ];

    const punchCols = Array.from({ length: maxPunchCount }, (_, idx) => ({
      label: maxPunchCount === 1 ? "Punch" : `Punch ${idx + 1}`,
      width: 120,
      key: `punch-${idx}`,
    }));

    return [selectColumn, ...base, ...punchCols];
  }, [maxPunchCount]);

  // Selection logic
  const selectedEmployeeIdsSet = useMemo(
    () => new Set(selectedEmployees),
    [selectedEmployees]
  );

  const isAllSelected = useMemo(() => {
    if (filteredData.length === 0) return false;
    return filteredData.every((emp) => {
      const id = emp.companyEmployeeId || emp.employeeId || emp.id;
      return selectedEmployees.includes(id);
    });
  }, [filteredData, selectedEmployees]);

  const isIndeterminate = useMemo(() => {
    if (selectedEmployees.length === 0) return false;
    if (isAllSelected) return false;
    return filteredData.some((emp) => {
      const id = emp.companyEmployeeId || emp.employeeId || emp.id;
      return selectedEmployees.includes(id);
    });
  }, [selectedEmployees, isAllSelected, filteredData]);

  const toggleSelectEmployee = useCallback((id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      const filteredIds = new Set(
        filteredData.map(
          (emp) => emp.companyEmployeeId || emp.employeeId || emp.id
        )
      );
      setSelectedEmployees((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const filteredIds = filteredData.map(
        (emp) => emp.companyEmployeeId || emp.employeeId || emp.id
      );
      setSelectedEmployees((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  }, [filteredData, isAllSelected]);

  const selectedEmployeeData = useMemo(
    () =>
      employees.filter((emp) => {
        const id = emp.companyEmployeeId || emp.employeeId || emp.id;
        return selectedEmployees.includes(id);
      }),
    [employees, selectedEmployees]
  );

  // Cell renderer
  const cellRenderer = useCallback(
    ({ columnIndex, key, rowIndex, style }) => {
      const isHeader = rowIndex === 0;
      const isSticky = columnIndex < 4;

      if (isHeader) {
        if (columnIndex === 0) {
          return (
            <div
              key={key}
              style={{
                ...style,
                fontWeight: 600,
                fontSize: "14px",
                color: "#374151",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: isSticky ? 60 : 10,
              }}
            >
              Select
            </div>
          );
        }

        return (
          <div
            key={key}
            style={{
              ...style,
              fontWeight: 600,
              fontSize: "14px",
              color: "#374151",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: isSticky ? 60 : 10,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "0 8px",
            }}
          >
            {columns[columnIndex].label}
          </div>
        );
      }

      const employee = filteredData[rowIndex - 1];
      if (!employee) return null;

      const empId =
        employee.companyEmployeeId || employee.employeeId || employee.id;
      const isSelected = selectedEmployeeIdsSet.has(empId);

      if (columnIndex === 0) {
        return (
          <div
            key={key}
            style={{
              ...style,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: isSelected ? "#F0F9FF" : "white",
              zIndex: isSticky ? 40 : 1,
            }}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelectEmployee(empId)}
              className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
            />
          </div>
        );
      }

      let content = "";
      switch (columns[columnIndex].key) {
        case "date":
          content = employee.punch?.date || "";
          break;
        case "name":
          content = (employee.name || "").split("<")[0];
          break;
        case "employeeId":
          content =
            employee.companyEmployeeId ||
            employee.employeeId ||
            employee.id ||
            "";
          break;
        case "designation":
          content = employee.designation || "";
          break;
        case "department":
          content = employee.department || "";
          break;
        default: {
          const punchIndex = columnIndex - 6;
          const checkIn = employee.punch?.checkIn;
          content = Array.isArray(checkIn)
            ? checkIn[punchIndex] ?? ""
            : punchIndex === 0
            ? checkIn ?? ""
            : "";
        }
      }

      return (
        <div
          key={key}
          style={{
            ...style,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: isSelected ? "#F0F9FF" : "white",
            fontSize: "14px",
            color: "#4B5563",
            zIndex: isSticky ? 40 : 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            padding: "0 8px",
          }}
          className="hover:bg-gray-50"
        >
          {content}
        </div>
      );
    },
    [filteredData, columns, selectedEmployeeIdsSet, toggleSelectEmployee]
  );

  const isWaiting = employees.length === 0 && !isProcessing && !isFetching;

  // FIXED: Updated loading logic to include isRefreshing
  const showLoading =
    isWaiting ||
    isSearching ||
    isProcessing ||
    isFetching ||
    isFilterLoading ||
    isRefreshing;

  const getLoadingMessage = () => {
    if (isWaiting) return "Loading employee data...";
    if (isRefreshing) return "Refreshing all data...";
    if (isProcessing) return "Processing attendance data...";
    if (isFilterLoading) return "Switching filter...";
    if (isFetching) return "Fetching data...";
    if (isSearching) return "Searching...";
    return "Loading...";
  };

  return (
    <div className="h-[80vh] w-[77vw]">
      {/* Top Controls */}
      <div className="flex justify-between items-end mb-2.5 bg-[#E6ECF0] px-4 py-6 rounded-2xl">
        <AttendanceFilters />
        <DateRangePicker />
        <SearchBox
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={handleSearch}
          handleReset={handleReset}
          handleKeyDown={handleKeyDown}
          searchQuery={searchQuery}
        />
      </div>

      {/* Select All */}
      <div className="flex justify-between mb-2">
        <div className="flex items-center gap-2 justify-center">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-[#004368] data-[state=checked]:border-[#004368] data-[state=checked]:text-white"
          />
          <p className="text-[#8AA9BA] font-semibold">Select All</p>
        </div>
        <div
          className={`border border-[#004368] text-[#004368] rounded-2xl flex justify-center items-center gap-2.5 px-4 py-1 transition-colors ${
            isRefreshing || isFetching
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer  "
          }`}
          onClick={isRefreshing || isFetching ? undefined : handleRefresh}
        >
          <div className={isRefreshing || isFetching ? "animate-spin" : ""}>
            <RefreshIcon />
          </div>
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </div>
      </div>

      {/* Virtualized Table */}
      <div
        className=" rounded-md overflow-hidden"
        style={{ height: "60vh", width: "100%" }}
      >
        {showLoading ? (
          <div className="flex justify-center items-center h-full text-gray-500 bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>{getLoadingMessage()}</p>
            </div>
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <MultiGrid
                fixedRowCount={1}
                fixedColumnCount={4}
                rowCount={filteredData.length + 1}
                columnCount={columns.length}
                columnWidth={({ index }) => columns[index].width}
                rowHeight={50}
                width={width}
                height={height}
                cellRenderer={cellRenderer}
                style={{
                  outline: "none",
                }}
                scrollToAlignment="start"
                tabIndex={null}
              />
            )}
          </AutoSizer>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-end mt-4 text-sm text-gray-500">
        <MemoizedAttendanceExport
          selectedEmployeeData={selectedEmployeeData}
          maxPunchCount={maxPunchCount}
        />
      </div>
    </div>
  );
};

export default memo(AttendanceTable);
