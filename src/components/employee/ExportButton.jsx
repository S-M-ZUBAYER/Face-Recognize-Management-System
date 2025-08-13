import React from "react";
import { ExpandIcon } from "lucide-react";

function ExportButton({ onExport }) {
  return (
    <button
      onClick={onExport}
      className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
    >
      <ExpandIcon /> Export Excel
    </button>
  );
}

export default ExportButton;
