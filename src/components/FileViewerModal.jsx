// components/FileViewerModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  File,
  FileText,
  Image,
  File as FilePdf,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useFileViewerStore from "@/zustand/fileViewerStore";

const FileViewerModal = () => {
  const { isOpen, fileUrl, fileName, fileType, closeFileViewer } =
    useFileViewerStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setError("Failed to download file");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFileViewer}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-6xl 
                       flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#004368]/10">
                  {fileType === "pdf" && (
                    <FilePdf className="w-5 h-5 text-[#004368]" />
                  )}
                  {fileType === "image" && (
                    <Image className="w-5 h-5 text-[#004368]" />
                  )}
                  {fileType === "other" && (
                    <File className="w-5 h-5 text-[#004368]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {fileName || "File Viewer"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {fileType?.toUpperCase() || "UNKNOWN"} FILE
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  onClick={closeFileViewer}
                  variant="ghost"
                  size="sm"
                  className="rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-100 p-4 overflow-auto">
              {error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-gray-600">{error}</p>
                  </div>
                </div>
              ) : (
                <>
                  {fileType === "image" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-full"
                    >
                      <img
                        src={fileUrl}
                        alt={fileName}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                          setError("Failed to load image");
                          setIsLoading(false);
                        }}
                      />
                    </motion.div>
                  )}

                  {fileType === "pdf" && (
                    <iframe
                      src={`${fileUrl}#toolbar=1&navpanes=1`}
                      className="w-full h-full rounded-lg"
                      title={fileName}
                      onLoad={() => setIsLoading(false)}
                      onError={() => {
                        setError("Failed to load PDF");
                        setIsLoading(false);
                      }}
                    />
                  )}

                  {fileType === "other" && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          This file type cannot be previewed
                        </p>
                        <Button onClick={handleDownload} variant="default">
                          <Download className="w-4 h-4 mr-2" />
                          Download to view
                        </Button>
                      </div>
                    </div>
                  )}

                  {isLoading &&
                    (fileType === "image" || fileType === "pdf") && (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-[#004368] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FileViewerModal;
