import { useState, useEffect } from 'react'

import Checkbox from '../Form/Checkbox'
import { Sort as IconSort } from '../Icons'
import LoadingContent from '../Loading/LoadingContent'

import Pagination from './Pagination'

export interface TableHeaderProps {
  label: string
  key: string
  sort?: boolean
  onSort?: () => void
  width?: string | number
  className?: string
  colSpan?: number
  rowSpan?: number
  hasAction?: boolean
  subheaders?: {
    label: string
    key: string
    sort?: boolean
    onSort?: () => void
    className?: string
  }[]
}

interface TableProps {
  tableHeaders: TableHeaderProps[]
  tableData: Record<string, any>[]
  isStripped?: boolean
  total?: number
  page?: number
  limit?: number
  withCheckBox?: boolean
  onClickRow?: (dataId: number | string) => void
  onChangePage?: (page: number) => void
  onClickCheckBox?: (dataIds: number[]) => void
  checkedIds?: number[]
  isLoading?: boolean
}

const Table = ({
  tableHeaders,
  tableData,
  isStripped = true,
  withCheckBox = false,
  total = 0,
  page = 1,
  limit = 1,
  onChangePage,
  onClickRow,
  onClickCheckBox,
  checkedIds,
  isLoading
}: TableProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const handleCheckAll = () => {
    const ids = tableData.map((item) => item.id)
    if (selectedIds.length) {
      setSelectedIds([])
      onClickCheckBox?.([])
    } else {
      setSelectedIds(ids)
      onClickCheckBox?.(ids)
    }
  }

  const handleCheck = (id: number) => {
    const isExist = selectedIds.includes(id)
    if (isExist) {
      const newSelectedIds = selectedIds.filter(
        (selectedId) => selectedId !== id
      )
      setSelectedIds(newSelectedIds)
      onClickCheckBox?.(newSelectedIds)
    } else {
      const newSelectedIds = [...selectedIds, id]
      setSelectedIds(newSelectedIds)
      onClickCheckBox?.(newSelectedIds)
    }
  }

  useEffect(() => {
    if (typeof checkedIds !== 'undefined') {
      setSelectedIds(checkedIds)
    }
  }, [checkedIds])

  return (
    <div className="w-full rounded-lg border border-slate-100 shadow-low overflow-visible bg-white dark:bg-slate-900 dark:border-slate-600">
      <div className="overflow-x-scroll">
        {isLoading ? (
          <LoadingContent />
        ) : (
          <table className="border-collapse min-w-full w-max relative">
            <thead>
              <tr className="text-table-header leading-6">
                {withCheckBox && (
                  <th aria-label="checkbox" className="py-3 px-4" rowSpan={2}>
                    <div className="flex items-center w-full justify-center">
                      <Checkbox
                        onClick={handleCheckAll}
                        checked={!!selectedIds.length}
                        indeterminate={selectedIds.length !== tableData.length}
                      />
                    </div>
                  </th>
                )}
                {tableHeaders.map((header) => (
                  <th
                    key={`${header.key}-${header.label}`}
                    className={`py-3 px-4 font-semibold text-slate-600 ${header.sort ? 'min-w-[100px]' : ''} dark:text-white ${header.className}`}
                    style={{ width: header.width }}
                    colSpan={header.colSpan}
                    rowSpan={header.rowSpan}
                  >
                    <div
                      className={`flex items-center w-full ${header.subheaders && !header.sort ? 'justify-center' : 'justify-between'}`}
                    >
                      {header.label}
                      {header.sort && (
                        <span
                          className="cursor-pointer"
                          onClick={header.onSort}
                          role="presentation"
                        >
                          <IconSort />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
              <tr>
                {tableHeaders.map((header) => {
                  if (header.subheaders) {
                    return header.subheaders?.map((subheader) => (
                      <th
                        key={`${subheader.key}-${subheader.label}`}
                        className={`py-3 px-4 ${subheader.sort ? 'min-w-[100px]' : ''} ${subheader.className}`}
                      >
                        <div className="flex justify-center items-center w-full">
                          {subheader.label}
                          {subheader.sort && (
                            <span
                              className="cursor-pointer"
                              onClick={subheader.onSort}
                              role="presentation"
                            >
                              <IconSort />
                            </span>
                          )}
                        </div>
                      </th>
                    ))
                  }
                  return null
                })}
              </tr>
            </thead>
            {tableData.length ? (
              <tbody>
                {tableData.map((data, index) => (
                  <tr
                    key={index}
                    className={`${isStripped ? 'odd:bg-sky-50 dark:odd:bg-sky-900' : ''} bg-white text-sm leading-6 text-slate-500 ${onClickRow ? 'hover:bg-sky-50 cursor-pointer' : ''} dark:bg-slate-800 dark:text-white`}
                    onClick={() => onClickRow?.(data.id)}
                  >
                    {withCheckBox && (
                      <td aria-label="checkbox" className="py-3 px-4">
                        <div className="flex items-center w-full justify-center">
                          <Checkbox
                            onClick={() => handleCheck(data.id)}
                            checked={selectedIds.includes(data.id)}
                          />
                        </div>
                      </td>
                    )}
                    {tableHeaders.map((header) => {
                      if (header.subheaders) {
                        return header.subheaders?.map((subheader) => (
                          <td
                            key={`${subheader.key}-${subheader.label}`}
                            className={`py-3 px-4 text-ellipsis ${header.hasAction ? '' : 'text-ellipsis overflow-hidden'} text-center`}
                          >
                            {data[subheader.key]}
                          </td>
                        ))
                      }
                      return (
                        <td
                          key={`${header.key}-${header.label}`}
                          className={`py-3 px-4 ${header.className} ${header.hasAction ? '' : 'text-ellipsis overflow-hidden'} whitespace-nowrap`}
                        >
                          {data[header.key]}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={99} className="text-center py-6">
                    <p className="text-md font-medium text-slate-600">
                      Belum ada data
                    </p>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        )}
      </div>
      <Pagination
        limit={limit}
        page={page}
        total={total}
        onChangePage={onChangePage}
      />
    </div>
  )
}

export default Table
