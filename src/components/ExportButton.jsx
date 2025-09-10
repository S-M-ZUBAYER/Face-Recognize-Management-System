// import React from "react";
// import image from "@/constants/image";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// function ExportButton({ selectedEmployeeData }) {
//   const handleExport = () => {
//     const filteredData = selectedEmployeeData;

//     const worksheet = XLSX.utils.json_to_sheet(filteredData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(data, "employee_list.xlsx");
//   };
//   return (
//     <button
//       onClick={handleExport}
//       className="flex items-center gap-2   border border-[#004368] text-[#004368] px-8 py-1 rounded-lg hover:bg-blue-50 font-bold"
//     >
//       <img src={image.xls} alt="xls" /> Export Excel
//     </button>
//   );
// }

// export default ExportButton;

import React from "react";
import image from "@/constants/image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ExportButton({ selectedEmployeeData }) {
  console.log(selectedEmployeeData, "excel");

  const handleExport = () => {
    if (!selectedEmployeeData || selectedEmployeeData.length === 0) return;

    // Remove unwanted columns from data
    const filteredData = selectedEmployeeData.map(
      ({ salaryRules, salaryInfo, ...rest }) => rest
    );

    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Set column widths (adjusted for remaining columns)
    const columns = [
      { wch: 25 }, // name
      { wch: 20 }, // employeeId
      { wch: 25 }, // companyEmployeeId
      { wch: 25 }, // department
      { wch: 30 }, // email
      { wch: 25 }, // designation
      { wch: 25 }, // deviceMAC
      { wch: 15 }, // salary
      { wch: 25 }, // salaryDetails
      { wch: 20 }, // payPeriod
    ];
    worksheet["!cols"] = columns;

    // Style header row: bold + background color + center alignment
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FF004368" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "employee_list.xlsx");
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
