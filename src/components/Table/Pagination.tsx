import {
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from '../Icons'

const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

const paginationRange = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: { totalCount: number, pageSize: number, siblingCount?: number, currentPage: number}) => {
  const totalPageCount = Math.ceil(totalCount / pageSize)

  const totalPageNumbers = siblingCount + 5

  if (totalPageNumbers >= totalPageCount) {
    return range(1, totalPageCount)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPageCount,
  )

  const shouldShowLeftDots = leftSiblingIndex > 2
  const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2

  const firstPageIndex = 1
  const lastPageIndex = totalPageCount

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = range(1, leftItemCount)

    return [...leftRange, '...', totalPageCount]
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = range(
      totalPageCount - rightItemCount + 1,
      totalPageCount,
    )
    return [firstPageIndex, '...', ...rightRange]
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex)
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex]
  }
  return []
}

interface PaginationProps {
  total?: number
  page?: number
  limit?: number
  onChangePage?: (page: number) => void
}

export default function Pagination({
  total = 0,
  page = 1,
  limit = 1,
  onChangePage,
}: PaginationProps) {
  const paginate = paginationRange({ totalCount: total, pageSize: limit, currentPage: page })

  const handleChangePage = (pageNumber: number) => {
    onChangePage?.(pageNumber)
  }

  const handleNextPage = () => {
    onChangePage?.(page + 1)
  }

  const handlePrevPage = () => {
    onChangePage?.(page - 1)
  }

  const firstNumber = (limit * (page - 1)) + 1
  const lastNumber = (limit * (page - 1)) + limit

  return (
    <div className="flex flex-col justify-between w-full px-6 py-4 border-t border-slate-100 bg-white dark:bg-slate-900 gap-2 sm:items-center dark:border-slate-600 sm:flex-row">
      <p className="text-xs text-slate-600 font-semibold dark:text-white">
        {`Menampilkan ${firstNumber}-${lastNumber < total ? lastNumber : total} dari ${total} data.`}
      </p>
      <div className="flex justify-between items-center gap-1">
        <button
          className="w-8 h-8 rounded-full disabled:text-slate-400 justify-center flex items-center text-slate-600 hover:bg-sky-100 disabled:hover:bg-transparent dark:text-white dark:hover:bg-slate-700 dark:disabled:hover:bg-transparent dark:disabled:text-slate-400"
          type="button"
          aria-label="prev"
          disabled={page < 2}
          onClick={handlePrevPage}
        >
          <IconChevronLeft className="w-4 h-4" />
        </button>
        {paginate.map((pageNumber, index) => (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={`w-8 h-8 rounded-full font-normal ${pageNumber === page ? 'bg-sky-700 text-white hover:bg-sky-700' : 'bg-transparent text-slate-600'} hover:bg-sky-100 text-sm dark:text-white dark:hover:bg-slate-700`}
            type="button"
            aria-label="page"
            disabled={typeof pageNumber !== 'number'}
            onClick={typeof pageNumber !== 'number' ? () => undefined : () => handleChangePage(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          className="w-8 h-8 rounded-full disabled:text-slate-400 justify-center flex items-center text-slate-600 hover:bg-sky-100 disabled:hover:bg-transparent dark:text-white dark:hover:bg-slate-700 dark:disabled:hover:bg-transparent dark:disabled:text-slate-400"
          type="button"
          aria-label="next"
          onClick={handleNextPage}
          disabled={lastNumber >= total}
        >
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
