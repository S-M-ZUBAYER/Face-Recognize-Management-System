import React, { memo, useMemo, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import AttendanceFilters from "./AttendanceFilters";
import DateRangePicker from "./DateRangePicker";
import AttendanceExport from "./AttendanceExport";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";

// --- Layout constants ---
const COL_WIDTHS = { select: 56, date: 140, name: 260, employeeId: 160 };
const LEFT_POSITIONS = [
  0,
  COL_WIDTHS.select,
  COL_WIDTHS.select + COL_WIDTHS.date,
  COL_WIDTHS.select + COL_WIDTHS.date + COL_WIDTHS.name,
];

const AttendanceTable = ({ employees = [] }) => {
  const { IsLoading } = useAttendanceStore();

  // --- State ---
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // --- Compute max punch count ---
  const maxPunchCount = useMemo(() => {
    return (
      employees.reduce((max, emp) => {
        const checkIn = emp?.punch?.checkIn;
        if (Array.isArray(checkIn)) return Math.max(max, checkIn.length);
        if (checkIn) return Math.max(max, 1);
        return max;
      }, 0) || 1
    );
  }, [employees]);

  // --- Filter employees only when searchQuery changes ---
  const filteredData = useMemo(() => {
    if (!searchQuery) return employees;

    setIsSearching(true);
    const q = searchQuery.toLowerCase();
    const result = employees.filter((emp) => {
      const date = (emp?.punch?.date ?? "").toLowerCase();
      const name = (emp?.name ?? "").split("<")[0].toLowerCase();
      const empId = (emp?.companyEmployeeId ?? emp?.id ?? "")
        .toString()
        .toLowerCase();
      return date.includes(q) || name.includes(q) || empId.includes(q);
    });
    setIsSearching(false);

    return result;
  }, [employees, searchQuery]);

  // --- Selection logic ---
  const selectedEmployeeIdsSet = useMemo(
    () => new Set(selectedEmployees),
    [selectedEmployees]
  );
  const isAllSelected =
    filteredData.length > 0 && selectedEmployees.length === filteredData.length;
  const isIndeterminate =
    selectedEmployees.length > 0 &&
    selectedEmployees.length < filteredData.length;

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEmployees(
        employees.map((emp) => emp.companyEmployeeId || emp.id)
      );
    } else {
      setSelectedEmployees([]);
    }
  };

  const toggleSelect = (id) =>
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // --- Columns (sticky + dynamic punches) ---
  const columns = useMemo(() => {
    const base = [
      {
        id: "select",
        header: () => <div style={{ width: COL_WIDTHS.select }} />,
        cell: ({ row }) => {
          const id = row.original.companyEmployeeId || row.original.id;
          return (
            <div style={{ width: COL_WIDTHS.select }}>
              <Checkbox
                checked={selectedEmployeeIdsSet.has(id)}
                onCheckedChange={() => toggleSelect(id)}
              />
            </div>
          );
        },
      },
      { accessorKey: "punch.date", header: "Date" },
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => (info.getValue() ?? "").split("<")[0],
      },
      { accessorKey: "companyEmployeeId", header: "Employee ID" },
      { accessorKey: "designation", header: "Designation" },
      { accessorKey: "department", header: "Department" },
    ];

    const punchCols = Array.from({ length: maxPunchCount }, (_, idx) => ({
      id: `punch-${idx}`,
      header: maxPunchCount === 1 ? "Punch" : `Punch ${idx + 1}`,
      cell: ({ row }) => {
        const checkIn = row.original?.punch?.checkIn;
        return Array.isArray(checkIn) ? checkIn[idx] ?? "" : checkIn ?? "";
      },
    }));

    return [...base, ...punchCols];
  }, [maxPunchCount, selectedEmployeeIdsSet]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedEmployeeData = employees.filter((emp) =>
    selectedEmployees.includes(emp.companyEmployeeId || emp.id)
  );

  // --- Render helper for sticky cell/header ---
  const getStickyStyle = useCallback((colIndex) => {
    if (colIndex >= 4) return {};
    const width =
      colIndex === 0
        ? COL_WIDTHS.select
        : colIndex === 1
        ? COL_WIDTHS.date
        : colIndex === 2
        ? COL_WIDTHS.name
        : COL_WIDTHS.employeeId;

    return {
      left: `${LEFT_POSITIONS[colIndex]}px`,
      width: `${width}px`,
      minWidth: `${width}px`,
      maxWidth: `${width}px`,
    };
  }, []);

  return (
    <div className="h-[80vh] w-[77vw]">
      {/* --- Top Controls --- */}
      <div className="flex justify-between items-end mb-2.5 bg-[#E6ECF0] px-4 py-6 rounded-2xl">
        <AttendanceFilters />
        <DateRangePicker />
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Date, Employee ID or Name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-72 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004368] border-[#004368]"
          />
          <button
            onClick={() => setSearchQuery(searchInput)}
            className="px-4 py-2 bg-[#004368] text-white rounded-md text-sm"
          >
            Search
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded-md text-sm"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* --- Select All --- */}
      <div className="flex items-center gap-2 mb-3">
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onCheckedChange={handleSelectAll}
        />
        <p className="text-[#8AA9BA] font-semibold">Select All</p>
      </div>

      {/* --- Table --- */}
      <div className="overflow-x-auto overflow-y-auto relative h-[60vh] border rounded-md">
        {isSearching || IsLoading ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            Loading...
          </div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-[#E6ECF0] sticky top-0 z-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, colIndex) => {
                    const sticky = colIndex < 4;
                    return (
                      <th
                        key={header.id}
                        style={getStickyStyle(colIndex)}
                        className={`p-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap ${
                          sticky ? "sticky z-60 bg-[#E6ECF0]" : ""
                        }`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#E6ECF0] bg-white">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell, colIndex) => {
                      const sticky = colIndex < 4;
                      return (
                        <td
                          key={cell.id}
                          style={getStickyStyle(colIndex)}
                          className={`p-3 text-sm text-gray-600 whitespace-nowrap ${
                            sticky ? "sticky z-40 bg-white" : ""
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-gray-500"
                  >
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- Bottom Controls --- */}
      <div className="flex justify-end mt-4 text-sm text-gray-500">
        <AttendanceExport
          selectedRows={selectedEmployeeData}
          maxPunchCount={maxPunchCount}
        />
      </div>
    </div>
  );
};

export default memo(AttendanceTable);
