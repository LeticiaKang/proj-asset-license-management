import { useState, useCallback } from 'react';
import { PAGE_SIZE } from '@/utils/constants';

interface PaginationState {
  page: number;
  size: number;
}

export function usePagination(defaultSize = PAGE_SIZE) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: defaultSize,
  });

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setPagination({ page: page - 1, size: pageSize });
  }, []);

  const resetPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  return {
    page: pagination.page,
    size: pagination.size,
    current: pagination.page + 1,
    onPageChange,
    resetPage,
  };
}
