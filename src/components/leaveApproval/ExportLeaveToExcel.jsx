import React, { useState } from "react";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { format } from "date-fns";

const ExportLeaveToExcel = ({ leaves }) => {
  const [isExporting, setIsExporting] = useState(false);

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: "Pending",
      approved_leader: "Approved by Leader",
      approved_admin: "Approved by Admin",
      rejected_leader: "Rejected by Leader",
      rejected_admin: "Rejected by Admin",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const getLeaveTypeDisplay = (leaveType) => {
    return leaveType || "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy hh:mm a");
    } catch {
      return dateString;
    }
  };

  const getApproverNames = (approverName) => {
    if (!approverName) return { leader: "N/A", admin: "N/A" };
    return {
      leader: approverName.leader || "N/A",
      admin: approverName.admin || "N/A",
    };
  };

  const exportToExcel = async () => {
    if (!leaves || leaves.length === 0) {
      alert("No data to export");
      return;
    }

    setIsExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Leave Applications");

      // Set column widths
      worksheet.columns = [
        { key: "serial", width: 8 },
        { key: "employeeId", width: 15 },
        { key: "employeeName", width: 25 },
        { key: "leaveCategory", width: 18 },
        { key: "leaveType", width: 18 },
        { key: "startDate", width: 15 },
        { key: "endDate", width: 15 },
        { key: "duration", width: 12 },
        { key: "description", width: 35 },
        { key: "leaderApprover", width: 20 },
        { key: "adminApprover", width: 20 },
        { key: "status", width: 20 },
        { key: "appliedDate", width: 20 },
        { key: "deviceMAC", width: 20 },
      ];

      // Title Row
      const titleRow = worksheet.addRow([
        "Leave Applications Report",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      worksheet.mergeCells("A1:N1");
      titleRow.height = 30;
      titleRow.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleRow.alignment = { vertical: "middle", horizontal: "center" };
      titleRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF004368" },
      };

      // Info Row
      const infoRow = worksheet.addRow([
        `Generated on: ${format(new Date(), "MMMM dd, yyyy hh:mm a")}`,
        "",
        "",
        "",
        "",
        "",
        "",
        `Total Records: ${leaves.length}`,
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      worksheet.mergeCells("A2:G2");
      worksheet.mergeCells("H2:N2");
      infoRow.height = 20;
      infoRow.font = { size: 10, italic: true };
      infoRow.alignment = { vertical: "middle", horizontal: "left" };
      infoRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F5" },
      };

      // Empty row for spacing
      worksheet.addRow([]);

      // Header Row
      const headerRow = worksheet.addRow([
        "No.",
        "Employee ID",
        "Employee Name",
        "Leave Category",
        "Leave Type",
        "Start Date",
        "End Date",
        // "Duration",
        "Description",
        "Leader Approver",
        "Admin Approver",
        "Status",
        "Applied Date",
        "Device MAC",
      ]);
      headerRow.height = 25;
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0066A1" },
      };

      // Add borders to header
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
      });

      // Data Rows
      leaves.forEach((leave, index) => {
        const approvers = getApproverNames(leave.approverName);
        // const startDate = new Date(leave.startDate);
        // const endDate = new Date(leave.endDate);
        // const duration =
        //   Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        const row = worksheet.addRow([
          index + 1,
          leave.companyEmployeeId || "N/A",
          leave.employeeName || "N/A",
          leave.leaveCategory || "N/A",
          getLeaveTypeDisplay(leave.leaveType),
          formatDate(leave.startDate),
          formatDate(leave.endDate),
          //   `${duration} day${duration > 1 ? "s" : ""}`,
          leave.description?.des || "No description",
          approvers.leader,
          approvers.admin,
          getStatusDisplay(leave.status),
          formatDateTime(leave.createdAt),
          leave.deviceMAC || "N/A",
        ]);

        // Row styling
        row.height = 20;
        row.alignment = { vertical: "middle", wrapText: true };
        row.font = { size: 10 };

        // Alternate row colors
        if (index % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFAFAFA" },
          };
        }

        // Add borders
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFD3D3D3" } },
            left: { style: "thin", color: { argb: "FFD3D3D3" } },
            bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
            right: { style: "thin", color: { argb: "FFD3D3D3" } },
          };
        });

        // Status color coding
        const statusCell = row.getCell(12);
        if (leave.status?.includes("approved")) {
          statusCell.font = { color: { argb: "FF008000" }, bold: true };
        } else if (leave.status?.includes("rejected")) {
          statusCell.font = { color: { argb: "FFFF0000" }, bold: true };
        } else if (leave.status === "pending") {
          statusCell.font = { color: { argb: "FFFF8C00" }, bold: true };
        }

        // Center align specific columns
        [1, 6, 7, 8, 12].forEach((colNum) => {
          row.getCell(colNum).alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        });
      });

      // Summary Row
      const summaryRow = worksheet.addRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "Total Records:",
        leaves.length,
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      worksheet.mergeCells(`G${summaryRow.number}:G${summaryRow.number}`);
      summaryRow.font = { bold: true, size: 11 };
      summaryRow.alignment = { vertical: "middle", horizontal: "right" };
      summaryRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE8F4F8" },
      };

      // Freeze panes (freeze header rows)
      worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 4 }];

      // Auto-filter
      worksheet.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4, column: 14 },
      };

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download file
      const fileName = `Leave_Applications_${format(new Date(), "yyyy-MM-dd_HHmmss")}.xlsx`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setIsExporting(false);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export data. Please try again.");
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToExcel}
      disabled={isExporting || !leaves || leaves.length === 0}
      variant="outline"
      className="border-[#004368] text-[#8896B4] hover:text-[#8896B4] transition-colors"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to Excel
        </>
      )}
    </Button>
  );
};

export default ExportLeaveToExcel;
