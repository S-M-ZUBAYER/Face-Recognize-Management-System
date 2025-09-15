import React, { memo } from "react";
import image from "@/constants/image";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";

function AttendanceExport({ selectedEmployeeData = [], maxPunchCount = 1 }) {
  console.log("Selected Employee Data:", selectedEmployeeData);
  console.log("Max Punch Count:", maxPunchCount);
  const { startDate, getFormattedRange } = useDateRangeStore();

  const format = getFormattedRange();

  const { selectedDate } = useAttendanceStore();
  const date = new Date(selectedDate);
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const handleExport = async () => {
    // Check if there's data to export
    if (!selectedEmployeeData || selectedEmployeeData.length === 0) {
      alert("Please select employees to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Timesheet");

    // =========================================================
    // 🔹 USE MAX PUNCH COUNT FROM PROPS OR CALCULATE
    // =========================================================
    let finalMaxPunchCount = maxPunchCount;

    // Double-check max punch count from selected data
    selectedEmployeeData.forEach((emp) => {
      const checkIn = emp?.punch?.checkIn;
      if (Array.isArray(checkIn)) {
        finalMaxPunchCount = Math.max(finalMaxPunchCount, checkIn.length);
      } else if (checkIn) {
        finalMaxPunchCount = Math.max(finalMaxPunchCount, 1);
      }
    });

    if (finalMaxPunchCount === 0) finalMaxPunchCount = 1;

    // =========================================================
    // 🔹 HEADER SECTION
    // =========================================================
    const baseHeaders = ["Date", "Name", "ID", "Department", "Designation"];
    const punchHeaders = Array.from({ length: finalMaxPunchCount }, (_, i) =>
      finalMaxPunchCount === 1 ? "Punch" : `Punch ${i + 1}`
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
    const selectedRow = worksheet.addRow([
      `Selected Date: ${startDate !== null ? format : selectedDate}`,
    ]);
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
    // 🔹 TABLE DATA (Updated for AttendanceTable structure)
    // =========================================================
    selectedEmployeeData.forEach((emp) => {
      // Get punch data from the emp.punch.checkIn structure
      const checkIn = emp?.punch?.checkIn;
      let times = [];

      if (Array.isArray(checkIn)) {
        times = checkIn;
      } else if (checkIn) {
        times = [checkIn];
      }

      // Fill punches dynamically up to finalMaxPunchCount
      const punchCols = [];
      for (let i = 0; i < finalMaxPunchCount; i++) {
        punchCols.push(times[i] || "-");
      }

      // Get date from emp.punch.date or use selectedDate
      const punchDate = emp?.punch?.date || selectedDate;
      const dateObj = punchDate ? new Date(punchDate) : null;
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
        (emp.name || "").split("<")[0] || "", // Clean name
        emp.companyEmployeeId || emp.id || "",
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
    saveAs(
      new Blob([buffer]),
      `${startDate !== null ? format : formatted}_Attendance_Report.xlsx`
    );
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 border border-[#004368] text-[#004368] px-8 py-1 rounded-lg hover:bg-blue-50 font-bold"
      disabled={!selectedEmployeeData || selectedEmployeeData.length === 0}
    >
      <img src={image.xls} alt="xls" />
      Export Excel ({selectedEmployeeData?.length || 0} selected)
    </button>
  );
}

export default memo(AttendanceExport);
