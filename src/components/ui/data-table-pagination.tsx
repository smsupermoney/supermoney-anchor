
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

type DataTablePaginationProps = {
  pageIndex: number;
  pageCount: number;
  setPageIndex: (updater: (old: number) => number) => void;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export function DataTablePagination({
  pageIndex,
  pageCount,
  setPageIndex,
  hasPreviousPage,
  hasNextPage,
}: DataTablePaginationProps) {

  const previousPage = () => {
    setPageIndex((old) => old - 1);
  };
  
  const nextPage = () => {
    setPageIndex((old) => old + 1);
  };

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <div className="flex-1">
        Page {pageIndex + 1} of {pageCount}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={previousPage}
          disabled={!hasPreviousPage}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={nextPage}
          disabled={!hasNextPage}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
