
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';
import { Select } from './Select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (limit: number) => void;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 gap-4">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <span>Rows per page:</span>
        <div className="w-20">
            <Select 
                options={[
                    { label: '5', value: 5 },
                    { label: '10', value: 10 },
                    { label: '25', value: 25 },
                    { label: '50', value: 50 },
                ]}
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="py-1"
            />
        </div>
        <span className="hidden sm:inline-block ml-2">
            {startItem}-{endItem} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onPageChange(1)} 
            disabled={currentPage === 1}
            title="First Page"
        >
            <ChevronsLeft size={16} />
        </Button>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            title="Previous Page"
        >
            <ChevronLeft size={16} />
        </Button>
        
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
            Page {currentPage} of {totalPages}
        </span>

        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            title="Next Page"
        >
            <ChevronRight size={16} />
        </Button>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onPageChange(totalPages)} 
            disabled={currentPage === totalPages}
            title="Last Page"
        >
            <ChevronsRight size={16} />
        </Button>
      </div>
    </div>
  );
};
