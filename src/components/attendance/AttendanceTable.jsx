import React, { memo, useState, useMemo, useCallback, useEffect } from "react";
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

// Memoized components
const MemoizedAttendanceExport = memo(AttendanceExport);
const MemoizedAttendanceFilters = memo(AttendanceFilters);
const MemoizedDateRangePicker = memo(DateRangePicker);

// SearchBox component
const SearchBox = memo(
  ({ searchInput, setSearchInput, handleSearch, handleReset, searchQuery }) => {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by Date, ID, Name or Department..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-72 border rounded-md px-3 py-2 text-sm focus:outline-none border-[#004368]"
        />
        <button
          onClick={handleSearch}
          disabled={!searchInput.trim()}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            searchInput.trim()
              ? "bg-[#004368] text-white hover:bg-[#003155]"
              : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          Search
        </button>
        {searchQuery && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    );
  }
);

const AttendanceTable = ({ employees = [] }) => {
  // Store selectors
  const isProcessing = useAttendanceStore((state) => state.isProcessing);
  const isFilterLoading = useAttendanceStore((state) => state.isFilterLoading);
  const activeFilter = useAttendanceStore((state) => state.activeFilter);
  const isRefreshing = useAttendanceStore((state) => state.isRefreshing);
  const refreshAttendanceData = useAttendanceStore(
    (state) => state.refreshAttendanceData
  );

  // Hooks
  const { startDate, endDate } = useDateRangeStore();
  const { refresh } = useAttendanceData();
  const { refetch: refetchEmployees } = useEmployees();
  const { refetch: refetchOverTime } = useOverTimeData();

  // Local state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track when initial load is complete
  useEffect(() => {
    if (employees.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [employees.length, isInitialLoad]);

  // Auto-unselect when filters change
  useEffect(() => {
    if (selectedEmployees.length > 0) {
      setSelectedEmployees([]);
    }
  }, [activeFilter, startDate, endDate, searchQuery, selectedEmployees.length]);

  // Search handlers
  const handleSearch = useCallback(() => {
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
    }
  }, [searchInput]);

  const handleReset = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await refreshAttendanceData({
        refetchEmployees,
        refetchAttendance: refresh,
        refetchOverTime,
      });
    } catch (error) {
      console.error("Refresh error:", error);
    }
  }, [refreshAttendanceData, refetchEmployees, refresh, refetchOverTime]);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!searchQuery) return employees;

    const query = searchQuery.toLowerCase();
    return employees.filter((emp) => {
      const date = (emp?.punch?.date || "").toLowerCase();
      const name = (emp?.name || "").split("<")[0].toLowerCase();
      const empId = (emp?.companyEmployeeId || emp?.employeeId || emp?.id || "")
        .toString()
        .toLowerCase();
      const department = (emp?.department || "").toLowerCase();

      return (
        date.includes(query) ||
        name.includes(query) ||
        empId.includes(query) ||
        department.includes(query)
      );
    });
  }, [employees, searchQuery]);

  // Max punch count
  const maxPunchCount = useMemo(() => {
    let max = 1;
    employees.forEach((emp) => {
      const checkIn = emp?.punch?.checkIn;
      if (Array.isArray(checkIn)) {
        max = Math.max(max, checkIn.length);
      } else if (checkIn) {
        max = Math.max(max, 1);
      }
    });
    return max;
  }, [employees]);

  // Columns definition
  const columns = useMemo(() => {
    const baseColumns = [
      { label: "", width: 56, key: "select" },
      { label: "Date", width: 140, key: "date" },
      { label: "Name", width: 260, key: "name" },
      { label: "Employee ID", width: 160, key: "employeeId" },
      { label: "Designation", width: 200, key: "designation" },
      { label: "Department", width: 200, key: "department" },
    ];

    const punchColumns = Array.from({ length: maxPunchCount }, (_, idx) => ({
      label: maxPunchCount === 1 ? "Punch" : `Punch ${idx + 1}`,
      width: 120,
      key: `punch-${idx}`,
    }));

    return [...baseColumns, ...punchColumns];
  }, [maxPunchCount]);

  // Selection logic
  const selectedEmployeeIdsSet = useMemo(
    () => new Set(selectedEmployees),
    [selectedEmployees]
  );

  const isAllSelected = useMemo(() => {
    return (
      filteredData.length > 0 &&
      filteredData.every((emp) => {
        const id = emp.companyEmployeeId || emp.employeeId || emp.id;
        return selectedEmployees.includes(id);
      })
    );
  }, [filteredData, selectedEmployees]);

  const isIndeterminate = useMemo(() => {
    return (
      selectedEmployees.length > 0 &&
      !isAllSelected &&
      filteredData.some((emp) => {
        const id = emp.companyEmployeeId || emp.employeeId || emp.id;
        return selectedEmployees.includes(id);
      })
    );
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
      const newIds = filteredData.map(
        (emp) => emp.companyEmployeeId || emp.employeeId || emp.id
      );
      setSelectedEmployees((prev) => [...new Set([...prev, ...newIds])]);
    }
  }, [filteredData, isAllSelected]);

  const selectedEmployeeData = useMemo(
    () =>
      employees.filter((emp) =>
        selectedEmployees.includes(
          emp.companyEmployeeId || emp.employeeId || emp.id
        )
      ),
    [employees, selectedEmployees]
  );

  // Cell renderer
  const cellRenderer = useCallback(
    ({ columnIndex, key, rowIndex, style }) => {
      const isHeader = rowIndex === 0;
      const isSticky = columnIndex < 4;

      if (isHeader) {
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
              backgroundColor: "#f8fafc",
            }}
          >
            {columnIndex === 0 ? "Select" : columns[columnIndex].label}
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
              backgroundColor: isSelected ? "#F0F9FF" : "white",
              zIndex: isSticky ? 40 : 1,
            }}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelectEmployee(empId)}
              className="data-[state=checked]:bg-[#004368]"
            />
          </div>
        );
      }

      let content = "";
      const columnKey = columns[columnIndex].key;

      switch (columnKey) {
        case "date":
          content = employee.punch?.date || "";
          break;
        case "name":
          content = (employee.name || "").split("<")[0];
          break;
        case "employeeId":
          content = empId;
          break;
        case "designation":
          content = employee.designation || "";
          break;
        case "department":
          content = employee.department || "";
          break;
        default:
          if (columnKey.startsWith("punch-")) {
            const punchIndex = columnIndex - 6;
            const checkIn = employee.punch?.checkIn;
            content = Array.isArray(checkIn)
              ? checkIn[punchIndex] || ""
              : punchIndex === 0
              ? checkIn || ""
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
            backgroundColor: isSelected ? "#F0F9FF" : "white",
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

  // Loading and empty states - FIXED LOGIC
  const isLoading =
    isProcessing || isFilterLoading || isRefreshing || isInitialLoad;
  const hasData = employees.length > 0;
  const hasFilteredData = filteredData.length > 0;

  const getStatusMessage = () => {
    // Show loading states first
    if (isLoading) {
      if (isRefreshing) return "Refreshing data...";
      if (isProcessing) return "Processing attendance data...";
      if (isFilterLoading) return "Applying filter...";
      return "Loading employee data...";
    }

    // Then check for search results
    if (searchQuery && !hasFilteredData) {
      return "No employees match your search";
    }

    // Finally check for empty data
    if (!hasData) {
      return "No employee data available";
    }

    return null;
  };

  const showStatusMessage = getStatusMessage() !== null;

  return (
    <div className="h-[80vh] w-[77vw]">
      {/* Top Controls */}
      <div className="flex justify-between items-end mb-2.5 bg-[#E6ECF0] px-4 py-6 rounded-2xl">
        <MemoizedAttendanceFilters />
        <MemoizedDateRangePicker />
        <SearchBox
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={handleSearch}
          handleReset={handleReset}
          searchQuery={searchQuery}
        />
      </div>

      {/* Select All & Refresh */}
      {!isInitialLoad && hasData && (
        <div className="flex justify-between mb-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onCheckedChange={handleSelectAll}
              disabled={!hasFilteredData}
              className="data-[state=checked]:bg-[#004368]"
            />
            <p className="text-[#8AA9BA] font-semibold">Select All</p>
          </div>
          <div
            className={`border border-[#004368] text-[#004368] rounded-2xl flex items-center gap-2.5 px-4 py-1 cursor-pointer hover:bg-[#004368] hover:text-white transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={isLoading ? undefined : handleRefresh}
          >
            <div className={isLoading ? "animate-spin" : ""}>
              <RefreshIcon />
            </div>
            {isLoading ? "Refreshing..." : "Refresh"}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div
        className="rounded-md overflow-hidden"
        style={{ height: "60vh", width: "100%" }}
      >
        {showStatusMessage ? (
          <div className="flex justify-center items-center h-full bg-white text-gray-500">
            <div className="text-center">
              {isLoading && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              )}
              <p>{getStatusMessage()}</p>
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
                style={{ outline: "none" }}
                scrollToAlignment="start"
                tabIndex={null}
              />
            )}
          </AutoSizer>
        )}
      </div>

      {/* Export */}
      {hasData && selectedEmployeeData.length > 0 && (
        <div className="flex justify-end mt-4">
          <MemoizedAttendanceExport
            selectedEmployeeData={selectedEmployeeData}
            maxPunchCount={maxPunchCount}
          />
        </div>
      )}
    </div>
  );
};

export default memo(AttendanceTable);
