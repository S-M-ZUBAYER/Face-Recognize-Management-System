import React from "react";
import image from "@/constants/image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

function AttendanceExport({ selectedEmployeeData }) {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Timesheet");

    // 🔹 Define the columns for the table
    const headers = [
      "Date",
      "Name",
      "ID",
      "Department",
      "Designation",
      "Punch 1",
      "Punch 2",
      "Punch 3",
      "Punch 4",
      "Punch 5",
      "Punch 6",
    ];

    const totalColumns = headers.length;

    // =========================================================
    // 🔹 HEADER SECTION
    // =========================================================

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
    const today = new Date().toLocaleDateString("en-GB");
    const selectedRow = worksheet.addRow([`Selected Date: ${today}`]);
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
    const DateTime = `${now.toLocaleDateString(
      "en-GB"
    )}, ${now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
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

      const row = [
        emp.date || today, // First column always shows the date
        emp.name.split("<")[0] || "",
        emp.employeeId || "",
        emp.department || "",
        emp.designation || "",
        times[0] || "-",
        times[1] || "-",
        times[2] || "-",
        times[3] || "-",
        times[4] || "-",
        times[5] || "-",
      ];
      worksheet.addRow(row);
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
    // 🔹 FREEZE PANES (table header + first column)
    // =========================================================
    worksheet.views = [
      {
        state: "frozen",
        xSplit: 1, // Freeze first column (Date)
        ySplit: headerRow.number, // Freeze header row
        topLeftCell: `B${headerRow.number + 1}`, // Scrollable area starts after header & first column
        activeCell: `A${headerRow.number + 1}`,
      },
    ];

    // =========================================================
    // 🔹 EXPORT FILE
    // =========================================================
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "timesheet_report.xlsx");
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
