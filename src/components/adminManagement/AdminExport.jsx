import React from "react";
import image from "@/constants/image";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function AdminExport({ selectedEmployeeData }) {
  console.log(selectedEmployeeData, "excel");

  const handleExport = async () => {
    if (!selectedEmployeeData || selectedEmployeeData.length === 0) return;

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Admins");

    // Transform admin data for export
    const filteredData = selectedEmployeeData.map(
      ({ id, devices, ...admin }) => {
        // Flatten device information with unique dates
        const deviceInfo =
          devices && devices.length > 0
            ? {
                totalDevices: devices.length,
                deviceNames: devices.map((d) => d.deviceName).join(", "),
                deviceMACs: devices.map((d) => d.deviceMAC).join(", "),
                activeDevices: devices.filter((d) => d.active).length,
                deviceDescriptions: devices
                  .map((d) => d.deviceDescription)
                  .join(", "),
                // Remove duplicate dates and sort them
                deviceCreatedDates: [
                  ...new Set(devices.map((d) => d.createdAt)),
                ]
                  .filter((date) => date) // Remove empty/null dates
                  .sort()
                  .join(", "),
              }
            : {
                totalDevices: 0,
                deviceNames: "",
                deviceMACs: "",
                activeDevices: 0,
                deviceDescriptions: "",
                deviceCreatedDates: "",
              };

        return {
          adminName: admin.adminName || "",
          adminEmail: admin.adminEmail || "",
          phone: admin.phone || "",
          status: admin.loggedIn ? "Active" : "Inactive",
          ...deviceInfo,
        };
      }
    );

    // Define column headers
    const headers = [
      "Admin Name",
      "Admin Email",
      "Phone",
      "Status",
      "Total Devices",
      "Device Names",
      "Device MACs",
      "Active Devices",
      "Device Descriptions",
      "Device Created Dates",
    ];

    // Add header row
    const headerRow = worksheet.addRow(headers);

    // Style header row
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF004368" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: false,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows
    filteredData.forEach((row) => {
      const dataRow = worksheet.addRow([
        row.adminName,
        row.adminEmail,
        row.phone,
        row.status,
        row.totalDevices,
        row.deviceNames,
        row.deviceMACs,
        row.activeDevices,
        row.deviceDescriptions,
        row.deviceCreatedDates,
      ]);

      // Style data rows
      dataRow.eachCell((cell) => {
        cell.alignment = {
          horizontal: "left",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Set column widths
    const columnWidths = [25, 30, 15, 12, 15, 40, 40, 15, 50, 30];
    worksheet.columns.forEach((column, index) => {
      column.width = columnWidths[index] || 20;
    });

    // Auto-fit row heights
    worksheet.eachRow((row) => {
      row.height = 25;
    });

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create blob and save file
    const data = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "admin_list.xlsx");
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

export default AdminExport;
