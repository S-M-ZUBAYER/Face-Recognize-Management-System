import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function CustomPagination({ handlePageChange, currentPage, totalPages }) {
  const maxVisiblePages = 3; // how many pages to show around current

  const getPageNumbers = () => {
    const pages = [];

    // Always show first page
    if (currentPage > 1 + maxVisiblePages) {
      pages.push(1, "ellipsis-start");
    }

    // Middle pages
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Always show last page
    if (currentPage < totalPages - maxVisiblePages) {
      pages.push("ellipsis-end", totalPages);
    }

    return pages;
  };

  return (
    <div>
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
              style={{ color: "#004368" }}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {getPageNumbers().map((page, idx) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={currentPage === page}
                  style={{ color: "#004368" }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
              style={{ color: "#004368" }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default CustomPagination;
