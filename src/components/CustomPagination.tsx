import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CustomPaginationProps = {
  page?: number;
  count?: number;
  onChangePage?: (value: number) => void;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (value: number) => void;
};

export const CustomPagination = ({
  page,
  count,
  onChangePage,
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}: CustomPaginationProps) => {
  const resolvedPage = page ?? currentPage ?? 1;
  const resolvedCount =
    count ??
    (totalItems !== undefined
      ? Math.max(1, Math.ceil(totalItems / itemsPerPage))
      : 1);
  const resolvedOnChange = onChangePage || onPageChange || (() => {});

  if (resolvedCount <= 1) return null;

  return (
    <div className="flex items-center gap-4 justify-end text-xs font-semibold text-slate-500">
      <button
        type="button"
        onClick={() => resolvedPage > 1 && resolvedOnChange(resolvedPage - 1)}
        disabled={resolvedPage === 1}
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span>
        Trang <strong className="text-slate-800">{resolvedPage}</strong> / <strong className="text-slate-800">{resolvedCount}</strong>
      </span>
      <button
        type="button"
        onClick={() => resolvedPage < resolvedCount && resolvedOnChange(resolvedPage + 1)}
        disabled={resolvedPage === resolvedCount}
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
