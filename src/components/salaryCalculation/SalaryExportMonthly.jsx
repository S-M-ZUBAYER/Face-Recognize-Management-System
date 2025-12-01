import React from "react";
import image from "@/constants/image";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useDateStore } from "@/zustand/useDateStore";

function SalaryExportMonthly({ selectedEmployeeData }) {
  // console.log(selectedEmployeeData);
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
    const worksheet = workbook.addWorksheet("Salary Details");

    // =========================================================
    // 🔹 HEADERS
    // =========================================================
    const headers = [
      "Name",
      "Employee ID",
      "Company ID",
      "Department",
      "Designation",
      "Late Count",
      "Early Departure Count",
      "Missed Punch",
      "Missed Full Punch",
      "Total Lateness Hours",
      "Normal Overtime",
      "Weekend Overtime",
      "Holiday Overtime",
      "Overtime Pay",
      "Overtime Rate",
      "Standard Pay",
      "Earned Salary",
      "Present Days Salary",
      "additionalAmount",
      "Total Pay",
      "Normal Present",
      "Weekend Present",
      "Holiday Present",
      "Absent Days",
      "Working Days",
      "Working Days (Up to Current)",
    ];

    // =========================================================
    // 🔹 TITLE ROW
    // =========================================================
    const titleRow = worksheet.addRow([
      `Salary Details - ${monthInfo.monthYear}`,
    ]);
    worksheet.mergeCells(1, 1, 1, headers.length);
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
    // 🔹 META INFO
    // =========================================================
    const selectedRow = worksheet.addRow([
      `Selected Period: ${monthInfo.startDate} - ${monthInfo.endDate}`,
    ]);
    worksheet.mergeCells(
      selectedRow.number,
      1,
      selectedRow.number,
      headers.length
    );
    selectedRow.font = { bold: true, size: 14 };

    const now = new Date();
    const DateTime = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const exportedRow = worksheet.addRow([`Exported: ${DateTime}`]);
    worksheet.mergeCells(
      exportedRow.number,
      1,
      exportedRow.number,
      headers.length
    );
    exportedRow.font = { bold: true, size: 14 };

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
    // 🔹 ROWS
    // =========================================================
    selectedEmployeeData.forEach((emp) => {
      const stats = emp.salaryDetails?.attendanceStats || {};
      const overtime = emp.salaryDetails?.overtimeDetails || {};
      const present = emp.salaryDetails?.Present || {};

      const rowData = [
        emp.name?.split("<")[0] || "",
        emp.employeeId || emp.companyEmployeeId || "",
        emp.companyEmployeeId || "",
        emp.department || "",
        emp.designation || "",
        stats.lateCount ?? 0,
        stats.earlyDepartureCount ?? 0,
        stats.missedPunch ?? 0,
        stats.missedFullPunch ?? 0,
        stats.totalLatenessHours ?? 0,
        overtime.normal ?? 0,
        overtime.weekend ?? 0,
        overtime.holiday ?? 0,
        emp.salaryDetails?.overtimePay ?? 0,
        emp.salaryDetails?.overtimeSalary ?? 0,
        emp.salaryDetails?.standardPay ?? 0,
        emp.salaryDetails?.earnedSalary ?? 0,
        emp.salaryDetails?.presentDaysSalary ?? 0,
        emp?.additionalAmount ?? 0,
        emp?.totalAmount ?? 0,
        present.normalPresent ?? 0,
        present.weekendPresent ?? 0,
        present.holidayPresent ?? 0,
        emp.salaryDetails?.absent ?? 0,
        emp.salaryDetails?.workingDays ?? 0,
        emp.salaryDetails?.workingDaysUpToCurrent ?? 0,
      ];

      worksheet.addRow(rowData);
    });

    // =========================================================
    // 🔹 AUTO COLUMN WIDTH
    // =========================================================
    worksheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, value.length);
      });
      col.width = Math.min(Math.max(maxLength + 2, 12), 30);
    });

    // =========================================================
    // 🔹 FREEZE PANES
    // =========================================================
    worksheet.views = [
      {
        state: "frozen",
        xSplit: 2, // freeze first 2 columns
        ySplit: headerRow.number, // freeze header
      },
    ];

    // =========================================================
    // 🔹 EXPORT FILE
    // =========================================================
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Salary_${monthInfo.monthYear}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 border border-[#004368] text-[#004368] px-4 py-1 rounded-lg hover:bg-blue-50 font-bold"
    >
      <img src={image.xls} alt="xls" /> Export Monthly Salary
    </button>
  );
}

export default SalaryExportMonthly;
