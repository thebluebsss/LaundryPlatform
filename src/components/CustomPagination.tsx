import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CustomPaginationProps = {
  page: number;
  count: number;
  onChangePage: (value: number) => void;
};

export const CustomPagination = ({ page, count, onChangePage }: CustomPaginationProps) => {
  if (count <= 1) return null;

  return (
    <div className="flex items-center gap-4 justify-end text-xs font-semibold text-slate-500">
      <button
        type="button"
        onClick={() => page > 1 && onChangePage(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span>
        Trang <strong className="text-slate-800">{page}</strong> / <strong className="text-slate-800">{count}</strong>
      </span>
      <button
        type="button"
        onClick={() => page < count && onChangePage(page + 1)}
        disabled={page === count}
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
