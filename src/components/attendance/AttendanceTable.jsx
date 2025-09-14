// import React, { memo, useState, useMemo, useCallback } from "react";
// import { AutoSizer, MultiGrid } from "react-virtualized";
// import "react-virtualized/styles.css";
// import AttendanceFilters from "./AttendanceFilters";
// import DateRangePicker from "./DateRangePicker";
// import { RefreshIcon } from "@/constants/icons";
// import { useAttendanceStore } from "@/zustand/useAttendanceStore";
// import { useAttendanceData } from "@/hook/useAttendanceData";
// import AttendanceExport from "./AttendanceExport";

// const AttendanceTable = ({ employees = [] }) => {
//   const { IsLoading } = useAttendanceStore();
//   const { refresh, isFetching } = useAttendanceData();

//   const [searchInput, setSearchInput] = useState("");
//   const [selectedEmployees, setSelectedEmployees] = useState([]);
//   const [searchType, setSearchType] = useState("All");

//   // Filter employees based on search input and search type
//   const filteredEmployees = useMemo(() => {
//     let data = employees;
//     if (searchType === "Present") {
//       data = employees.filter((emp) => emp.isPresent);
//     } else if (searchType === "Absent") {
//       data = employees.filter((emp) => !emp.isPresent);
//     } else if (searchType === "Overtime") {
//       data = employees.filter((emp) => emp.overtime);
//     }

//     if (searchInput.trim() === "") return data;

//     const q = searchInput.toLowerCase();
//     return data.filter((emp) => {
//       const date = (emp?.punch?.date ?? "").toLowerCase();
//       const name = (emp?.name ?? "").split("<")[0].toLowerCase();
//       const empId = (emp?.companyEmployeeId ?? emp?.id ?? "")
//         .toString()
//         .toLowerCase();
//       return date.includes(q) || name.includes(q) || empId.includes(q);
//     });
//   }, [employees, searchInput, searchType]);

//   // Determine max punch count
//   const maxPunchCount = useMemo(() => {
//     return (
//       employees.reduce((max, emp) => {
//         const checkIn = emp?.punch?.checkIn;
//         if (Array.isArray(checkIn)) return Math.max(max, checkIn.length);
//         if (checkIn) return Math.max(max, 1);
//         return max;
//       }, 0) || 1
//     );
//   }, [employees]);

//   // Column definitions
//   const columns = useMemo(() => {
//     const base = [
//       { label: "Date", width: 140, key: "date" },
//       { label: "Name", width: 260, key: "name" },
//       { label: "Employee ID", width: 160, key: "employeeId" },
//       { label: "Designation", width: 160, key: "designation" },
//       { label: "Department", width: 160, key: "department" },
//     ];

//     const punchCols = Array.from({ length: maxPunchCount }, (_, idx) => ({
//       label: `Punch ${idx + 1}`,
//       width: 100,
//       key: `punch-${idx}`,
//     }));

//     return [...base, ...punchCols];
//   }, [maxPunchCount]);

//   const cellRenderer = useCallback(
//     ({ columnIndex, key, rowIndex, style }) => {
//       if (rowIndex === 0) {
//         return (
//           <div
//             key={key}
//             style={{
//               ...style,
//               background: "#F1F5F9",
//               fontWeight: 600,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               borderBottom: "1px solid #ccc",
//               borderRight: "1px solid #ccc",
//             }}
//           >
//             {columns[columnIndex].label}
//           </div>
//         );
//       }

//       const employee = filteredEmployees[rowIndex - 1];
//       let content = "";

//       switch (columns[columnIndex].key) {
//         case "date":
//           content = employee.punch?.date || "";
//           break;
//         case "name":
//           content = employee.name;
//           break;
//         case "employeeId":
//           content = employee.companyEmployeeId || employee.id;
//           break;
//         case "designation":
//           content = employee.designation;
//           break;
//         case "department":
//           content = employee.department;
//           break;
//         default:
//           const punchIndex = columnIndex - 5;
//           const checkIn = employee.punch?.checkIn;
//           content = Array.isArray(checkIn) ? checkIn[punchIndex] ?? "" : "";
//       }

//       return (
//         <div
//           key={key}
//           style={{
//             ...style,
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             borderBottom: "1px solid #eee",
//             borderRight: "1px solid #eee",
//           }}
//         >
//           {content}
//         </div>
//       );
//     },
//     [filteredEmployees, columns]
//   );

//   return (
//     <div className="p-4 space-y-4">
//       <h2 className="font-semibold text-lg mb-2">Employee's Attendance</h2>

//       {/* Top controls */}
//       <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl gap-4">
//         <div className="flex gap-2 items-center">
//           {["All", "Present", "Absent", "Overtime"].map((type) => (
//             <button
//               key={type}
//               onClick={() => setSearchType(type)}
//               className={`px-4 py-1 rounded-full text-sm ${
//                 searchType === type
//                   ? "bg-[#004368] text-white"
//                   : "bg-white text-gray-600 border"
//               }`}
//             >
//               {type} (
//               {type === "All"
//                 ? employees.length
//                 : type === "Present"
//                 ? employees.filter((e) => e.isPresent).length
//                 : type === "Absent"
//                 ? employees.filter((e) => !e.isPresent).length
//                 : employees.filter((e) => e.overtime).length}
//               )
//             </button>
//           ))}
//         </div>

//         <div className="flex gap-2 items-center flex-1 justify-end">
//           <DateRangePicker />
//           <input
//             type="text"
//             placeholder="Search by Date, Employee ID or Name..."
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             className="border rounded-md px-3 py-2 text-sm w-72"
//           />
//           <button
//             onClick={() => setSearchInput("")}
//             className="px-4 py-2 bg-gray-400 text-white rounded-md text-sm"
//           >
//             Clear
//           </button>
//           <button
//             onClick={refresh}
//             className="px-4 py-2 bg-[#004368] text-white rounded-md text-sm flex items-center gap-2"
//           >
//             <RefreshIcon />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Virtualized table */}
//       <div style={{ height: "65vh", width: "100%" }}>
//         <AutoSizer>
//           {({ height, width }) => (
//             <MultiGrid
//               fixedRowCount={1}
//               fixedColumnCount={3}
//               rowCount={filteredEmployees.length + 1}
//               columnCount={columns.length}
//               columnWidth={({ index }) => columns[index].width}
//               rowHeight={40}
//               width={width}
//               height={height}
//               cellRenderer={cellRenderer}
//               style={{
//                 border: "1px solid #ccc",
//               }}
//               styleTopLeftGrid={{
//                 borderRight: "1px solid #ccc",
//                 borderBottom: "1px solid #ccc",
//               }}
//               styleTopRightGrid={{
//                 borderBottom: "1px solid #ccc",
//               }}
//               styleBottomLeftGrid={{
//                 borderRight: "1px solid #ccc",
//               }}
//             />
//           )}
//         </AutoSizer>
//       </div>

//       {/* Export button */}
//       <div className="flex justify-end mt-4">
//         <AttendanceExport
//           selectedEmployeeData={filteredEmployees}
//           maxPunchCount={maxPunchCount}
//         />
//       </div>
//     </div>
//   );
// };

// export default memo(AttendanceTable);

import React, { memo, useState, useMemo, useCallback } from "react";
import { AutoSizer, MultiGrid } from "react-virtualized";
import "react-virtualized/styles.css";
import AttendanceFilters from "./AttendanceFilters";
import DateRangePicker from "./DateRangePicker";
import { RefreshIcon } from "@/constants/icons";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useAttendanceData } from "@/hook/useAttendanceData";
import AttendanceExport from "./AttendanceExport";

const AttendanceTable = ({ employees = [] }) => {
  const { IsLoading } = useAttendanceStore();
  const { refresh, isFetching } = useAttendanceData();

  const [searchInput, setSearchInput] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchType, setSearchType] = useState("All");

  // Filter employees based on search input and search type
  const filteredEmployees = useMemo(() => {
    let data = employees;

    if (searchType === "Present") {
      data = employees.filter((emp) => emp.punch?.checkIn?.length > 0);
    } else if (searchType === "Absent") {
      data = employees.filter(
        (emp) => !emp.punch?.checkIn || emp.punch.checkIn.length === 0
      );
    } else if (searchType === "Overtime") {
      data = employees.filter((emp) => emp.overtime);
    }

    if (searchInput.trim() === "") return data;

    const q = searchInput.toLowerCase();
    return data.filter((emp) => {
      const date = (emp?.punch?.date ?? "").toLowerCase();
      const name = (emp?.name ?? "").split("<")[0].toLowerCase();
      const empId = (emp?.companyEmployeeId ?? emp?.id ?? "")
        .toString()
        .toLowerCase();
      return date.includes(q) || name.includes(q) || empId.includes(q);
    });
  }, [employees, searchInput, searchType]);

  // Determine max punch count
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

  // Column definitions including checkbox column
  const columns = useMemo(() => {
    const selectColumn = { label: "", width: 50, key: "select" };

    const base = [
      { label: "Date", width: 140, key: "date" },
      { label: "Name", width: 260, key: "name" },
      { label: "Employee ID", width: 160, key: "employeeId" },
      { label: "Designation", width: 160, key: "designation" },
      { label: "Department", width: 160, key: "department" },
    ];

    const punchCols = Array.from({ length: maxPunchCount }, (_, idx) => ({
      label: `Punch ${idx + 1}`,
      width: 100,
      key: `punch-${idx}`,
    }));

    return [selectColumn, ...base, ...punchCols];
  }, [maxPunchCount]);

  // Toggle individual employee selection
  const toggleSelectEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // Toggle select all filtered employees
  const toggleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(
        filteredEmployees.map((e) => e.id || e.companyEmployeeId)
      );
    }
  };

  // Cell renderer
  const cellRenderer = useCallback(
    ({ columnIndex, key, rowIndex, style }) => {
      if (rowIndex === 0) {
        // Header row
        if (columnIndex === 0) {
          return (
            <div
              key={key}
              style={{
                ...style,
                background: "#F1F5F9",
                fontWeight: 600,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderBottom: "1px solid #ccc",
                borderRight: "1px solid #ccc",
              }}
            >
              <input
                type="checkbox"
                checked={
                  selectedEmployees.length === filteredEmployees.length &&
                  filteredEmployees.length > 0
                }
                onChange={toggleSelectAll}
              />
            </div>
          );
        }

        return (
          <div
            key={key}
            style={{
              ...style,
              background: "#F1F5F9",
              fontWeight: 600,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
              borderRight: "1px solid #ccc",
            }}
          >
            {columns[columnIndex].label}
          </div>
        );
      }

      const employee = filteredEmployees[rowIndex - 1];

      // Checkbox column
      if (columnIndex === 0) {
        const empId = employee.id || employee.companyEmployeeId;
        return (
          <div
            key={key}
            style={{
              ...style,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderBottom: "1px solid #eee",
              borderRight: "1px solid #eee",
              background: selectedEmployees.includes(empId)
                ? "#E0F2FE"
                : "white",
            }}
          >
            <input
              type="checkbox"
              checked={selectedEmployees.includes(empId)}
              onChange={() => toggleSelectEmployee(empId)}
            />
          </div>
        );
      }

      // Other columns
      let content = "";
      switch (columns[columnIndex].key) {
        case "date":
          content = employee.punch?.date || "";
          break;
        case "name":
          content = employee.name;
          break;
        case "employeeId":
          content = employee.companyEmployeeId || employee.id;
          break;
        case "designation":
          content = employee.designation;
          break;
        case "department":
          content = employee.department;
          break;
        default:
          const punchIndex = columnIndex - 6; // 1 extra checkbox column
          const checkIn = employee.punch?.checkIn;
          content = Array.isArray(checkIn) ? checkIn[punchIndex] ?? "" : "";
      }

      return (
        <div
          key={key}
          style={{
            ...style,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderBottom: "1px solid #eee",
            borderRight: "1px solid #eee",
            background: selectedEmployees.includes(
              employee.id || employee.companyEmployeeId
            )
              ? "#E0F2FE"
              : "white",
          }}
        >
          {content}
        </div>
      );
    },
    [filteredEmployees, columns, selectedEmployees]
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold text-lg mb-2">Employee's Attendance</h2>

      {/* Top controls */}
      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl gap-4">
        <div className="flex gap-2 items-center">
          {["All", "Present", "Absent", "Overtime"].map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-4 py-1 rounded-full text-sm ${
                searchType === type
                  ? "bg-[#004368] text-white"
                  : "bg-white text-gray-600 border"
              }`}
            >
              {type} (
              {type === "All"
                ? employees.length
                : type === "Present"
                ? employees.filter((e) => e.punch?.checkIn?.length > 0).length
                : type === "Absent"
                ? employees.filter(
                    (e) => !e.punch?.checkIn || e.punch.checkIn.length === 0
                  ).length
                : employees.filter((e) => e.overtime).length}
              )
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center flex-1 justify-end">
          <DateRangePicker />
          <input
            type="text"
            placeholder="Search by Date, Employee ID or Name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-72"
          />
          <button
            onClick={() => setSearchInput("")}
            className="px-4 py-2 bg-gray-400 text-white rounded-md text-sm"
          >
            Clear
          </button>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-[#004368] text-white rounded-md text-sm flex items-center gap-2"
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>
      </div>

      {/* Virtualized table */}
      <div style={{ height: "65vh", width: "100%" }}>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              fixedRowCount={1}
              fixedColumnCount={4} // 3 original + 1 checkbox
              rowCount={filteredEmployees.length + 1}
              columnCount={columns.length}
              columnWidth={({ index }) => columns[index].width}
              rowHeight={40}
              width={width}
              height={height}
              cellRenderer={cellRenderer}
              style={{
                border: "1px solid #ccc",
              }}
              styleTopLeftGrid={{
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #ccc",
              }}
              styleTopRightGrid={{
                borderBottom: "1px solid #ccc",
              }}
              styleBottomLeftGrid={{
                borderRight: "1px solid #ccc",
              }}
            />
          )}
        </AutoSizer>
      </div>

      {/* Export button */}
      <div className="flex justify-end mt-4">
        <AttendanceExport
          selectedEmployeeData={filteredEmployees.filter((emp) =>
            selectedEmployees.includes(emp.id || emp.companyEmployeeId)
          )}
          maxPunchCount={maxPunchCount}
        />
      </div>
    </div>
  );
};

export default memo(AttendanceTable);
