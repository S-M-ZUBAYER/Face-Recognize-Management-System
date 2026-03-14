// components/FileViewerModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  File,
  FileText,
  Image,
  File as FilePdf,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useFileViewerStore from "@/zustand/fileViewerStore";

const FileViewerModal = () => {
  const { isOpen, fileUrl, fileName, fileType, closeFileViewer } =
    useFileViewerStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(fileUrl);
  // Image transformation states
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset transformations when new image loads
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [fileUrl]);

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

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(scale + delta, 0.5), 3);
    setScale(newScale);
  };

  // Drag handlers - only when mouse left button is pressed
  const handleMouseDown = (e) => {
    // Only enable drag if left button is pressed (button 0) and zoomed in
    if (e.button === 0 && scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      // setStartPosition({ x: position.x, y: position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setPosition({
        x: newX,
        y: newY,
      });
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      e.preventDefault();
      setIsDragging(false);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (scale > 1 && e.touches.length === 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      e.preventDefault();
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;

      setPosition({
        x: newX,
        y: newY,
      });
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
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
                {/* Image controls - only show for images */}
                {fileType === "image" && !error && (
                  <>
                    <Button
                      onClick={handleZoomIn}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      title="Zoom In (Mouse wheel)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleZoomOut}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      title="Zoom Out (Mouse wheel)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleRotate}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    {scale !== 1 && (
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        title="Reset view"
                      >
                        <Move className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
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
            <div
              ref={containerRef}
              className="flex-1 bg-gray-100 p-4 overflow-hidden select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onWheel={handleWheel}
            >
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
                    <div
                      className="flex items-center justify-center h-full"
                      style={{
                        cursor:
                          scale > 1
                            ? isDragging
                              ? "grabbing"
                              : "grab"
                            : "default",
                      }}
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleTouchStart}
                    >
                      <motion.img
                        ref={imageRef}
                        src={fileUrl}
                        alt={fileName}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        style={{
                          scale: scale,
                          rotate: rotation,
                          x: position.x,
                          y: position.y,
                          transition: isDragging
                            ? "none"
                            : "transform 0.2s ease-out",
                        }}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                          setError("Failed to load image");
                          setIsLoading(false);
                        }}
                        drag={false}
                        whileTap={{ scale: scale }}
                      />
                    </div>
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

            {/* Zoom indicator */}
            {fileType === "image" && scale !== 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm">
                {Math.round(scale * 100)}%
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FileViewerModal;
