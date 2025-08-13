import React from "react";
import image from "@/constants/image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ExportButton({ paginatedEmployee }) {
  const handleExport = () => {
    const filteredData = paginatedEmployee;

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "employee_list.xlsx");
  };
  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2   border border-[#004368] text-[#004368] px-8 py-1 rounded-lg hover:bg-blue-50 font-bold"
    >
      <img src={image.xls} alt="xls" /> Export Excel
    </button>
  );
}

export default ExportButton;
