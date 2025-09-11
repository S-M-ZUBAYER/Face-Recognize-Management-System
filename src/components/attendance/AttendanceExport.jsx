import React from "react";
import image from "@/constants/image";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";

function AttendanceExport({ selectedEmployeeData }) {
  console.log(selectedEmployeeData);
  const { selectedDate } = useAttendanceStore();
  const date = new Date(selectedDate);
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Timesheet");

    // =========================================================
    // 🔹 FIND MAX PUNCH COUNT
    // =========================================================
    let maxPunchCount = 0;
    selectedEmployeeData.forEach((emp) => {
      let times = [];
      try {
        if (typeof emp.checkIn === "string") times = JSON.parse(emp.checkIn);
        else if (Array.isArray(emp.checkIn)) times = emp.checkIn;
      } catch {
        times = [];
      }
      if (times.length > maxPunchCount) {
        maxPunchCount = times.length;
      }
    });
    if (maxPunchCount === 0) maxPunchCount = 1;

    // =========================================================
    // 🔹 HEADER SECTION
    // =========================================================
    const baseHeaders = ["Date", "Name", "ID", "Department", "Designation"];
    const punchHeaders = Array.from(
      { length: maxPunchCount },
      (_, i) => `Punch ${i + 1}`
    );
    const headers = [...baseHeaders, ...punchHeaders];
    const totalColumns = headers.length;

    // Row 1: Title
    const titleRow = worksheet.addRow(["Attendance Punch Data"]);
    worksheet.mergeCells(1, 1, 1, totalColumns);
    titleRow.getCell(1).font = {
      bold: true,
      size: 20,
      color: { argb: "FFFFFFFF" },
    };
    titleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    titleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "228B22" },
    };
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Row 2: Selected Date
    const selectedRow = worksheet.addRow([`Selected Date: ${selectedDate}`]);
    worksheet.mergeCells(
      selectedRow.number,
      1,
      selectedRow.number,
      totalColumns
    );
    selectedRow.getCell(1).font = { bold: true, size: 14 };
    selectedRow.getCell(1).alignment = { horizontal: "left" };

    // Row 3: Exported Date & Time
    const now = new Date();
    const DateTime = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const exportedRow = worksheet.addRow([`Export Date & Time: ${DateTime}`]);
    worksheet.mergeCells(
      exportedRow.number,
      1,
      exportedRow.number,
      totalColumns
    );
    exportedRow.getCell(1).font = { bold: true, size: 14 };
    exportedRow.getCell(1).alignment = { horizontal: "left" };

    worksheet.addRow([]); // Empty row for spacing

    // =========================================================
    // 🔹 TABLE HEADER
    // =========================================================
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // =========================================================
    // 🔹 TABLE DATA
    // =========================================================
    selectedEmployeeData.forEach((emp) => {
      let times = [];
      try {
        if (typeof emp.checkIn === "string") times = JSON.parse(emp.checkIn);
        else if (Array.isArray(emp.checkIn)) times = emp.checkIn;
      } catch {
        times = [];
      }

      // Fill punches dynamically up to maxPunchCount
      const punchCols = [];
      for (let i = 0; i < maxPunchCount; i++) {
        punchCols.push(times[i] || "-");
      }

      const dateObj = selectedDate ? new Date(selectedDate) : null;
      const formattedDate = dateObj
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(dateObj.getDate()).padStart(
            2,
            "0"
          )} (${dateObj.toLocaleDateString("en-US", { weekday: "long" })})`
        : "";

      // Row data
      const rowData = [
        formattedDate || "", // Date with weekday
        emp.name.split("<")[0] || "",
        emp.companyEmployeeId || "",
        emp.department || "",
        emp.designation || "",
        ...punchCols,
      ];

      worksheet.addRow(rowData);
    });

    // =========================================================
    // 🔹 AUTO COLUMN WIDTH (with limits)
    // =========================================================
    worksheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, value.length);
      });
      col.width = Math.min(Math.max(maxLength + 2, 10), 25);
    });

    // =========================================================
    // 🔹 FREEZE PANES (header row + first 2 columns)
    // =========================================================
    worksheet.views = [
      {
        state: "frozen",
        xSplit: 2, // Freeze Date + Name
        ySplit: headerRow.number, // Freeze header row
      },
    ];

    // =========================================================
    // 🔹 EXPORT FILE
    // =========================================================
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${formatted}_Attendance_Report.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 border border-[#004368] text-[#004368] px-8 py-1 rounded-lg hover:bg-blue-50 font-bold"
    >
      <img src={image.xls} alt="xls" /> Export Excel
    </button>
  );
}

export default AttendanceExport;
