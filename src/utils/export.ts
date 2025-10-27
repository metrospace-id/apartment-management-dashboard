import dayjs from 'dayjs'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'

import { toSnakeCase } from './string'

const FILE_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
const FILE_EXTENSION = '.xlsx'
const FILE_DATE_SUFFIX = `${dayjs().format('YYYYMMDD_HHmmss')}`

// eslint-disable-next-line import/prefer-default-export
export const exportToExcel = (
  rawData: Record<string, string>[],
  fileName = 'export'
) => {
  const ws = XLSX.utils.json_to_sheet(rawData)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: FILE_TYPE })
  FileSaver.saveAs(
    data,
    `${toSnakeCase(fileName)}_${FILE_DATE_SUFFIX}${FILE_EXTENSION}`
  )
}
