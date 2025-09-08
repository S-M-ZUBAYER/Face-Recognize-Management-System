import React from "react";
import image from "@/constants/image";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useDateStore } from "@/zustand/useDateStore";

function AttendanceExportMonthly({ selectedEmployeeData }) {
  const { selectedMonth, selectedYear } = useDateStore();
  const handleExport = async () => {
    if (
      !Array.isArray(selectedEmployeeData) ||
      selectedEmployeeData.length === 0
    ) {
      console.warn("No employee data provided!");
      return;
    }

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
    // 🔹 TITLE ROW
    // =========================================================
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

    // =========================================================
    // 🔹 META INFO ROWS
    // =========================================================

    const selectedRow = worksheet.addRow([
      `Selected Date: ${selectedMonth + 1}/${selectedYear} `,
    ]);
    worksheet.mergeCells(
      selectedRow.number,
      1,
      selectedRow.number,
      totalColumns
    );
    selectedRow.getCell(1).font = { bold: true, size: 14 };
    selectedRow.getCell(1).alignment = { horizontal: "left" };

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

    worksheet.addRow([]); // Empty row

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
    // 🔹 BUILD DATA
    // =========================================================
    const allFormattedData = [];

    selectedEmployeeData.forEach((emp) => {
      const punchDataArr = emp.salaryDetails?.punchData || [];

      punchDataArr.forEach((day) => {
        const times = Array.isArray(day.checkIn) ? day.checkIn : [];

        const rowData = [
          day.date || "",
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

        allFormattedData.push(rowData);
      });
    });

    if (allFormattedData.length === 0) {
      console.warn("No punch data to export!");
      return;
    }

    // 🔹 Add data rows
    allFormattedData.forEach((row) => {
      worksheet.addRow(row);
    });

    // =========================================================
    // 🔹 AUTO COLUMN WIDTHS
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
    // 🔹 FREEZE PANES (header row + first column)
    // =========================================================
    worksheet.views = [
      {
        state: "frozen",
        xSplit: 1, // freeze first column
        ySplit: headerRow.number, // freeze table header
      },
    ];

    // =========================================================
    // 🔹 EXPORT FILE
    // =========================================================
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "monthly_report.xlsx");
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 border border-[#004368] text-[#004368] px-4 py-1 rounded-lg hover:bg-blue-50 font-bold"
    >
      <img src={image.xls} alt="xls" /> Export Monthly Attendance
    </button>
  );
}

export default AttendanceExportMonthly;
