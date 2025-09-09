import React from "react";
import image from "@/constants/image";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useDateStore } from "@/zustand/useDateStore";

function AttendanceExportMonthly({ selectedEmployeeData }) {
  const { selectedMonth, selectedYear } = useDateStore();

  const getMonthInfo = (month, year) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const lastDay = new Date(year, month, 0).getDate();
    const monthName = months[month - 1];
    const shortYear = year.toString().slice(-2);
    const formattedMonth = month.toString().padStart(2, "0");

    return {
      monthYear: `${monthName} ${year}`,
      startDate: `01-${formattedMonth}-${shortYear}`,
      endDate: `${lastDay
        .toString()
        .padStart(2, "0")}-${formattedMonth}-${shortYear}`,
      lastDay,
    };
  };

  const monthInfo = getMonthInfo(selectedMonth + 1, selectedYear);

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

    // =========================================================
    // 🔹 FIND MAX PUNCH COUNT
    // =========================================================
    let maxPunchCount = 0;
    selectedEmployeeData.forEach((emp) => {
      emp.salaryDetails?.punchData?.forEach((day) => {
        const times = Array.isArray(day.checkIn) ? day.checkIn : [];
        if (times.length > maxPunchCount) {
          maxPunchCount = times.length;
        }
      });
    });

    // If no punches, fallback to at least 1 punch column
    if (maxPunchCount === 0) maxPunchCount = 1;

    // =========================================================
    // 🔹 DYNAMIC HEADERS
    // =========================================================
    const baseHeaders = ["Date", "Name", "ID", "Department", "Designation"];
    const punchHeaders = Array.from(
      { length: maxPunchCount },
      (_, i) => `Punch ${i + 1}`
    );
    const headers = [...baseHeaders, ...punchHeaders];
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
      `Selected Date: ${monthInfo.startDate} - ${monthInfo.endDate}`,
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

    worksheet.addRow([]);

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
    selectedEmployeeData.forEach((emp) => {
      const punchDataArr = emp.salaryDetails?.punchData || [];

      punchDataArr.forEach((day) => {
        const times = Array.isArray(day.checkIn) ? day.checkIn : [];

        // Fill up row with punches, up to maxPunchCount
        const punchCols = [];
        for (let i = 0; i < maxPunchCount; i++) {
          punchCols.push(times[i] || "-");
        }
        // Format date + weekday inside one column
        const dateObj = day.date ? new Date(day.date) : null;
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
      col.width = Math.min(Math.max(maxLength + 2, 10), 30);
    });

    // =========================================================
    // 🔹 FREEZE PANES (header row + first 2 columns)
    // =========================================================
    worksheet.views = [
      {
        state: "frozen",
        xSplit: 2, // freeze Date + Name
        ySplit: headerRow.number, // freeze header
      },
    ];

    // =========================================================
    // 🔹 EXPORT FILE
    // =========================================================
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${monthInfo.monthYear}.xlsx`);
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
