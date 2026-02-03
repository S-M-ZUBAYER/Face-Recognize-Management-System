import React from "react";
import image from "@/constants/image";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

function ExportButton({ selectedEmployeeData }) {
  const handleExport = async () => {
    if (!selectedEmployeeData || selectedEmployeeData.length === 0)
      return toast.error("Please select at least one employee.");

    // 🔹 Define headers
    const headers = [
      "Name",
      "Employee ID",
      "Company Employee ID",
      "Department",
      "Email",
      "Designation",
      "Device MAC",
      "Salary",
      // "Other Salary",
      // "Monthly Working Days",
      // "Overtime Salary",
      "Pay Period",
      "Shift",
      // "Work Start Time",
      // "Lunch Start Time",
      // "Lunch End Time",
      // "Work End Time",
      // "Overtime Start Time",
      // "Overtime End Time",
      // "Weekend Day",
    ];

    const totalColumns = headers.length;

    // 🔹 Transform employee data into rows
    const exportData = selectedEmployeeData.map((emp) => {
      const basicInfo = [
        emp.name ? emp.name.split("<")[0] : "",
        emp.employeeId || "",
        emp.companyEmployeeId || "",
        emp.department || "",
        emp.email || "",
        emp.designation || "",
        emp.deviceMAC || "",
      ];

      const salaryInfo = emp.salaryInfo
        ? [
            emp.salaryInfo.salary || "",
            // emp.salaryInfo.otherSalary || "",
            // emp.salaryInfo.hourlyRate || "",
            // emp.salaryInfo.overtimeSalary || "",
            emp.salaryInfo.payPeriod || "",
            emp.salaryInfo.shift || "",
          ]
        : ["", "", "", "", "", ""];

      // const scheduleRule = emp.salaryRules?.rules?.find(
      //   (rule) => rule.ruleId === "0",
      // );
      // const workSchedule = scheduleRule
      //   ? [
      //       scheduleRule.param1 || "",
      //       scheduleRule.param2 || "",
      //       scheduleRule.param3 || "",
      //       scheduleRule.param4 || "",
      //       scheduleRule.param5 || "",
      //       scheduleRule.param6 || "",
      //     ]
      //   : ["", "", "", "", "", ""];

      // const weekendRule = emp.salaryRules?.rules?.find(
      //   (rule) => rule.ruleId === "2",
      // );
      // const weekendInfo = [weekendRule?.param1 || ""];

      return [...basicInfo, ...salaryInfo];
    });

    // 🔹 Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employee Details");

    // 🔹 Title Row
    const titleRow = worksheet.addRow(["Employee Details"]);
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
      fgColor: { argb: "228B22" }, // Forest Green
    };

    worksheet.addRow([]); // blank row

    // 🔹 Header Row
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "004368" }, // Dark Blue
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 🔹 Data Rows
    exportData.forEach((row) => {
      const dataRow = worksheet.addRow(row);
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // 🔹 Column widths
    worksheet.columns = headers.map(() => ({ width: 20 }));

    // 🔹 Export file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "employee_details.xlsx");
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

export default ExportButton;
