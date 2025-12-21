import React, { memo, useState, useMemo, useCallback, useEffect } from "react";
import { AutoSizer, MultiGrid } from "react-virtualized";
import "react-virtualized/styles.css";
import AttendanceFilters from "./AttendanceFilters";
import DateRangePicker from "./DateRangePicker";
import AttendanceExport from "./AttendanceExport";
import { RefreshIcon } from "@/constants/icons";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
// import { useAttendanceData } from "@/hook/useAttendanceData";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";
import { Checkbox } from "@/components/ui/checkbox";
// import { useEmployees } from "@/hook/useEmployees";
// import { useOverTimeData } from "@/hook/useOverTimeData";
import useSubscriptionStore from "@/zustand/useSubscriptionStore";

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
  // Store selectors - CORRECTED
  const isProcessing = useAttendanceStore((state) => state.isProcessing);
  const isFilterLoading = useAttendanceStore((state) => state.isFilterLoading);
  const activeFilter = useAttendanceStore((state) => state.activeFilter);
  const isRefreshing = useAttendanceStore((state) => state.isRefreshing);

  // IMPORTANT: Make sure this function exists in your store
  // const refreshAttendanceData = useAttendanceStore(
  //   (state) => state.refreshAttendanceData
  // );

  const { paymentStatus, setIsSubscriptionRequiredModal } =
    useSubscriptionStore();

  // Hooks
  const { startDate, endDate } = useDateRangeStore();
  // const { refresh } = useAttendanceData();
  // const { refetch: refetchEmployees } = useEmployees();
  // const { refetch: refetchOverTime } = useOverTimeData();

  // Local state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [tableWidth, setTableWidth] = useState(0);

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
  }, [activeFilter, startDate, endDate, searchQuery]);

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

  // Calculate column widths based on content and available space
  const calculateColumnWidths = useCallback(
    (availableWidth) => {
      // Fixed widths for non-responsive columns
      const fixedWidths = {
        select: 56,
        date: 120,
        name: 220,
        employeeId: 140,
        punch: 100,
      };

      // Calculate total fixed width
      const totalFixedWidth =
        fixedWidths.select +
        fixedWidths.date +
        fixedWidths.name +
        fixedWidths.employeeId +
        maxPunchCount * fixedWidths.punch;

      // Available width for designation and department
      const availableForDynamic = Math.max(
        0,
        availableWidth - totalFixedWidth - 50
      );

      // Minimum widths
      const minWidths = {
        designation: 200,
        department: 180,
      };

      // Calculate based on content length
      let maxDesignationLength = minWidths.designation;
      let maxDepartmentLength = minWidths.department;

      employees.forEach((emp) => {
        const designation = emp.designation || "";
        const department = emp.department || "";

        const designationWidth = Math.min(designation.length * 7 + 30, 400);
        const departmentWidth = Math.min(department.length * 7 + 30, 350);

        maxDesignationLength = Math.max(maxDesignationLength, designationWidth);
        maxDepartmentLength = Math.max(maxDepartmentLength, departmentWidth);
      });

      const totalNeededWidth = maxDesignationLength + maxDepartmentLength;

      // If enough space, use calculated widths
      if (totalNeededWidth <= availableForDynamic) {
        return {
          ...fixedWidths,
          designation: maxDesignationLength,
          department: maxDepartmentLength,
        };
      }

      // Otherwise distribute proportionally
      const designationRatio = maxDesignationLength / totalNeededWidth;
      const departmentRatio = maxDepartmentLength / totalNeededWidth;

      return {
        ...fixedWidths,
        designation: Math.max(
          minWidths.designation,
          availableForDynamic * designationRatio
        ),
        department: Math.max(
          minWidths.department,
          availableForDynamic * departmentRatio
        ),
      };
    },
    [employees, maxPunchCount]
  );

  // Columns definition with responsive widths
  const columns = useMemo(() => {
    const widths = calculateColumnWidths(tableWidth || 1200);

    const baseColumns = [
      { label: "", width: widths.select, key: "select" },
      { label: "Date", width: widths.date, key: "date" },
      { label: "Name", width: widths.name, key: "name" },
      { label: "Employee ID", width: widths.employeeId, key: "employeeId" },
      { label: "Designation", width: widths.designation, key: "designation" },
      { label: "Department", width: widths.department, key: "department" },
    ];

    const punchColumns = Array.from({ length: maxPunchCount }, (_, idx) => ({
      label: maxPunchCount === 1 ? "Punch" : `Punch ${idx + 1}`,
      width: widths.punch,
      key: `punch-${idx}`,
    }));

    return [...baseColumns, ...punchColumns];
  }, [maxPunchCount, calculateColumnWidths, tableWidth]);

  // Selection logic
  const selectedEmployeeIdsSet = useMemo(
    () => new Set(selectedEmployees),
    [selectedEmployees]
  );

  const isAllSelected = useMemo(() => {
    if (filteredData.length === 0) return false;

    return filteredData.every((emp) => {
      const id = emp.companyEmployeeId || emp.employeeId || emp.id;
      return selectedEmployeeIdsSet.has(id);
    });
  }, [filteredData, selectedEmployeeIdsSet]);

  const isIndeterminate = useMemo(() => {
    if (filteredData.length === 0) return false;

    const hasSelected = filteredData.some((emp) => {
      const id = emp.companyEmployeeId || emp.employeeId || emp.id;
      return selectedEmployeeIdsSet.has(id);
    });

    return hasSelected && !isAllSelected;
  }, [filteredData, selectedEmployeeIdsSet, isAllSelected]);

  // Individual selection
  const toggleSelectEmployee = useCallback((id) => {
    setSelectedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return Array.from(newSet);
    });
  }, []);

  // Select all functionality
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
      setSelectedEmployees((prev) => {
        const newSet = new Set(prev);
        newIds.forEach((id) => newSet.add(id));
        return Array.from(newSet);
      });
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

  useEffect(() => {
    if (selectedEmployeeData.length > 2) {
      if (paymentStatus === false) {
        setIsSubscriptionRequiredModal(true);
        setSelectedEmployees([]);
      }
    }
  }, [
    paymentStatus,
    setIsSubscriptionRequiredModal,
    selectedEmployeeData.length,
  ]);

  // Cell renderer WITHOUT borders
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

      const isLongTextColumn =
        columnKey === "designation" ||
        columnKey === "department" ||
        columnKey === "punch-0";

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
            whiteSpace: isLongTextColumn ? "normal" : "nowrap",
            overflow: isLongTextColumn ? "visible" : "hidden",
            textOverflow: isLongTextColumn ? "clip" : "ellipsis",
            padding: isLongTextColumn ? "8px 12px" : "0 8px",
            textAlign: "center",
            wordBreak: isLongTextColumn ? "break-word" : "normal",
            lineHeight: isLongTextColumn ? "1.4" : "1",
            minHeight: "50px",
          }}
          className="hover:bg-gray-50"
          title={isLongTextColumn && content.length > 30 ? content : undefined}
        >
          {content}
        </div>
      );
    },
    [filteredData, columns, selectedEmployeeIdsSet, toggleSelectEmployee]
  );

  // Loading and empty states
  const isLoading =
    isProcessing || isFilterLoading || isRefreshing || isInitialLoad;
  const hasData = employees.length > 0;
  const hasFilteredData = filteredData.length > 0;

  const getStatusMessage = () => {
    if (isLoading) {
      if (isRefreshing) return "Refreshing data...";
      if (isProcessing) return "Processing attendance data...";
      if (isFilterLoading) return "Applying filter...";
      return "Loading employee data...";
    }

    if (searchQuery && !hasFilteredData) {
      return "No employees match your search";
    }

    if (!hasData) {
      return "No employee data available";
    }

    return null;
  };

  const showStatusMessage = getStatusMessage() !== null;

  // Handle table resize
  const handleResize = useCallback(({ width }) => {
    setTableWidth(width);
  }, []);

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
          {/* <div
            className={`border border-[#004368] text-[#004368] rounded-2xl flex items-center gap-2.5 px-4 py-1 cursor-pointer  transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={isLoading ? undefined : handleRefresh}
          >
            <div className={isLoading ? "animate-spin" : ""}>
              <RefreshIcon />
            </div>
            {isLoading ? "Refreshing..." : "Refresh"}
          </div> */}
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
          <AutoSizer onResize={handleResize}>
            {({ height, width }) => (
              <MultiGrid
                fixedRowCount={1}
                fixedColumnCount={4}
                rowCount={filteredData.length + 1}
                columnCount={columns.length}
                columnWidth={({ index }) => columns[index].width}
                rowHeight={({ index }) => {
                  if (index === 0) return 50;

                  const employee = filteredData[index - 1];
                  if (!employee) return 50;

                  const hasLongDesignation =
                    (employee.designation || "").length > 30;
                  const hasLongDepartment =
                    (employee.department || "").length > 30;

                  if (hasLongDesignation || hasLongDepartment) {
                    return 70;
                  }

                  return 50;
                }}
                width={width}
                height={height}
                cellRenderer={cellRenderer}
                style={{ outline: "none", border: "none" }} // No borders
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
