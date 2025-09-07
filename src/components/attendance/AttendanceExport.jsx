import React from "react";
import image from "@/constants/image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AttendanceExport({ selectedEmployeeData }) {
  const handleExport = () => {
    // 1️⃣ Format data to match the timesheet structure
    const formattedData = selectedEmployeeData.map((emp) => {
      const cleanEmp = { ...emp };

      // Remove unwanted fields
      delete cleanEmp.payPeriod;
      delete cleanEmp.salaryInfo;

      // Parse checkIn times
      let times = [];
      try {
        if (typeof emp.checkIn === "string") {
          times = JSON.parse(emp.checkIn);
        } else if (Array.isArray(emp.checkIn)) {
          times = emp.checkIn;
        }
      } catch {
        times = [];
      }

      // Remove the original checkIn field
      delete cleanEmp.checkIn;

      // Create separate punch columns (up to 6 punches like in the image)
      const punchData = {};
      for (let i = 1; i <= 6; i++) {
        punchData[`Punch ${i}`] = times[i - 1] || "-"; // Use "-" for empty punches
      }

      return {
        Date: cleanEmp.date || cleanEmp.Date || "",
        Name: cleanEmp.name || cleanEmp.Name || "",
        ID: cleanEmp.employeeId || cleanEmp.ID || "",
        Department: cleanEmp.department || cleanEmp.Department || "",
        Designation: cleanEmp.designation || cleanEmp.Designation || "",
        ...punchData,
      };
    });

    // 2️⃣ Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // 3️⃣ Auto column widths
    const colWidths = Object.keys(formattedData[0] || {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...formattedData.map((item) =>
            item[key] ? item[key].toString().length : 0
          )
        ) + 2,
    }));
    worksheet["!cols"] = colWidths;

    // 4️⃣ Create workbook and export
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "timesheet_report.xlsx");
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
