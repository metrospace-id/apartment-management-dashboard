import dayjs from 'dayjs'
import { useState, useEffect } from 'react'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import DatePicker from 'components/Form/DatePicker'
import Input from 'components/Form/Input'
import Layout from 'components/Layout'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import type { TableHeaderProps } from 'components/Table/Table'
import Table from 'components/Table/Table'
import Toast from 'components/Toast'
import { PAGE_SIZE } from 'constants/form'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'
import { exportToExcel } from 'utils/export'

const PAGE_NAME = 'Histori Barang'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Nama Barang',
    key: 'item_name'
  },
  {
    label: 'Tanggal',
    key: 'updated_at'
  },
  {
    label: 'Oleh',
    key: 'updated_by_name'
  },
  {
    label: 'Deskripsi',
    key: 'description'
  },
  {
    label: 'Debit',
    key: 'debit'
  },
  {
    label: 'Kredit',
    key: 'credit'
  },
  {
    label: 'Saldo',
    key: 'quantity_after'
  }
]

const PageItemHistory = () => {
  const [_userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0
  })
  const [page, setPage] = useState(1)

  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: ''
  })
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: ''
  })
  const [search, setSearch] = useState('')
  const [isModalFilterOpen, setIsModalFilterOpen] = useState(false)
  const debounceSearch = useDebounce(search, 500, () => setPage(1))

  const handleModalFilterOpen = () => {
    setIsModalFilterOpen(true)
  }

  const handleModalFilterClose = () => {
    setIsModalFilterOpen(false)
  }

  const handleCloseToast = () => {
    setToast({
      open: false,
      message: ''
    })
  }

  const handleExportExcel = () => {
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      exportToExcel(data.data, PAGE_NAME)
    }, 500)
  }

  const handleChangeFilterField = (
    fieldName: string,
    value: string | number
  ) => {
    setFilter((prevState) => ({
      ...prevState,
      [fieldName]: value
    }))
  }

  const handleGetItemHistories = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/item-history',
      withAuth: true,
      method: 'GET',
      params: {
        page,
        limit: PAGE_SIZE,
        search,
        ...filter
      }
    })
      .then(({ data: responseData }) => {
        setData(responseData.data)
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleSubmitFilter = () => {
    handleGetItemHistories()
    handleModalFilterClose()
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    item_name: column.item_name,
    updated_by_name: column.updated_by_name,
    updated_at: dayjs(column.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    description: column.description,
    debit:
      column.quantity_after < column.quantity_before ? column.quantity : '-',
    credit:
      column.quantity_after >= column.quantity_before ? column.quantity : '-',
    quantity_after: column.quantity_after
  }))

  useEffect(() => {
    handleGetItemHistories()
  }, [debounceSearch, page])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser.permissions) {
        setUserPermissions(localStorageUser.permissions)
      }
    }, 500)
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input
                placeholder="Cari nama"
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
            </div>
            <Button onClick={handleModalFilterOpen} variant="secondary">
              Filter
            </Button>
            <div className="sm:ml-auto flex gap-1">
              <Button onClick={handleExportExcel} variant="warning">
                Export
              </Button>
            </div>
          </div>

          <Table
            tableHeaders={TABLE_HEADERS}
            tableData={tableDatas}
            total={data.total}
            page={data.page}
            limit={PAGE_SIZE}
            onChangePage={setPage}
            isLoading={isLoadingData}
          />
        </div>
      </div>

      <Modal open={isModalFilterOpen} title="Filter" size="xs">
        <form autoComplete="off" className="grid grid-cols-1 gap-4 p-6">
          <div className="flex flex-col gap-2 w-full">
            <p className="text-sm font-medium text-slate-600 dark:text-white">
              Tanggal
            </p>
            <div className="flex flex-col gap-1">
              <DatePicker
                placeholder="Tanggal Awal"
                name="start_date"
                value={
                  filter.start_date
                    ? dayjs(filter.start_date).toDate()
                    : undefined
                }
                onChange={(selectedDate) =>
                  handleChangeFilterField(
                    'start_date',
                    dayjs(selectedDate).format('YYYY-MM-DD')
                  )
                }
                fullWidth
              />

              <DatePicker
                placeholder="Tanggal Akhir"
                name="end_date"
                value={
                  filter.end_date ? dayjs(filter.end_date).toDate() : undefined
                }
                onChange={(selectedDate) =>
                  handleChangeFilterField(
                    'end_date',
                    dayjs(selectedDate).format('YYYY-MM-DD')
                  )
                }
                fullWidth
              />
            </div>
          </div>
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFilterClose} variant="default">
            Tutup
          </Button>
          <Button onClick={handleSubmitFilter}>Kirim</Button>
        </div>
      </Modal>

      {isLoadingSubmit && <LoadingOverlay />}

      <Toast
        open={toast.open}
        message={toast.message}
        onClose={handleCloseToast}
      />
    </Layout>
  )
}

export default PageItemHistory
