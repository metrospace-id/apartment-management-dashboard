import {
  useState, useMemo, useEffect,
} from 'react'
import dayjs from 'dayjs'

import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Table from 'components/Table/Table'
import Button from 'components/Button'
import Modal from 'components/Modal'
import Input from 'components/Form/Input'
import Popover from 'components/Popover'
import { Edit as IconEdit, TrashAlt as IconTrash, FileText as IconFile } from 'components/Icons'
import type { TableHeaderProps } from 'components/Table/Table'
import useDebounce from 'hooks/useDebounce'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Toast from 'components/Toast'
import Autocomplete from 'components/Form/Autocomplete'
import DatePicker from 'components/Form/DatePicker'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import { exportToExcel } from 'utils/export'
import { ITEM_REQUEST_TYPE, ITEM_UNITS } from 'constants/item'
import Select from 'components/Form/Select'

const PAGE_NAME = 'Permintaan Barang'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No. Permintaan',
    key: 'request_no',
  },
  {
    label: 'Department',
    key: 'department_name',
  },
  {
    label: 'Jenis Permintaan',
    key: 'type',
  },
  {
    label: 'Dibuat Oleh',
    key: 'created_by',
  },
  {
    label: 'Disetujui Oleh',
    key: 'approved_by',
  },
  {
    label: 'Dikeluarkan Oleh',
    key: 'issued_by',
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true,
  },
]

const ITEM_LIST = Array.from(Array(5).keys()).map((key) => ({
  id: key + 1,
  item_id: key + 1,
  name: `Nama Barang ${key + 1}`,
  qty: 99,
  unit: 'Unit',
}))

const TABLE_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  request_no: `REQ/01/${key + 1}`,
  department_id: key + 1,
  department_name: `Nama Deparemen ${key + 1}`,
  type: (key % 2) + 1,
  phone_no: `08123${key + 1}`,
  created_by: `Nama Karyawan ${key + 1}`,
  approved_by: `Nama Karyawan ${key + 1}`,
  issued_by: key % 2 ? '-' : `Nama Karyawan ${key + 1}`,
  items: ITEM_LIST,
}))

const DEPARTMENT_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  name: `Nama Departemen ${key + 1}`,
}))

function PageItemRequest() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
    id: 0,
    type: 0,
    department_id: 0,
    approved_by: '',
    issued_by: '',
    status: '',
    items: [],
  })
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    item_category_id: 0,
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: '',
  })
  const [search, setSearch] = useState('')
  const [isModalFilterOpen, setIsModalFilterOpen] = useState(false)
  const [modalForm, setModalForm] = useState({
    title: '',
    open: false,
    readOnly: false,
  })
  const [modalConfirm, setModalConfirm] = useState({
    title: '',
    description: '',
    open: false,
  })
  const [submitType, setSubmitType] = useState('create')
  const [isModalDeleteItemOpen, setIsModalDeleteItemOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState({ id: 0, item_id: 0 })

  const debounceSearch = useDebounce(search, 500)

  const paginateTableData = useMemo(
    () => data.slice(page * PAGE_SIZE, (page * PAGE_SIZE) + PAGE_SIZE),
    [page, data],
  )

  const handleExportExcel = () => {
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      exportToExcel(data, PAGE_NAME)
    }, 500)
  }

  const handleCloseToast = () => {
    setToast({
      open: false,
      message: '',
    })
  }

  const handleModalFormClose = () => {
    setModalForm({
      title: '',
      open: false,
      readOnly: false,
    })
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false,
    }))
    setFields({
      id: 0,
      type: 0,
      department_id: 0,
      approved_by: '',
      issued_by: '',
      status: '',
      items: [],
    })
  }

  const handleModalFilterOpen = () => {
    setIsModalFilterOpen(true)
  }

  const handleModalFilterClose = () => {
    setIsModalFilterOpen(false)
  }

  const handleModalConfirmClose = () => {
    if (submitType !== 'delete') {
      setModalForm((prevState) => ({
        ...prevState,
        open: true,
      }))
    }
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false,
    }))
  }

  const handleModalCreateOpen = () => {
    setModalForm({
      title: `Tambah ${PAGE_NAME} Baru`,
      open: true,
      readOnly: false,
    })
  }

  const handleModalDetailOpen = (fieldData: any) => {
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true,
    })

    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      type: fieldData.type,
      department_id: fieldData.department_id,
      approved_by: fieldData.approved_by,
      issued_by: fieldData.issued_by,
      items: fieldData.items,
    }))
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setModalForm({
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      type: fieldData.type,
      department_id: fieldData.department_id,
      approved_by: fieldData.approved_by,
      issued_by: fieldData.issued_by,
      items: fieldData.items,
    }))
  }

  const handleModalDeleteOpen = (fieldData: any) => {
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE.delete.title,
      description: MODAL_CONFIRM_TYPE.delete.description,
      open: true,
    })
    setSubmitType('delete')
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      type: fieldData.type,
      department_id: fieldData.department_id,
      approved_by: fieldData.approved_by,
      issued_by: fieldData.issued_by,
      items: fieldData.items,
    }))
  }

  const handleModalDeleteItemOpen = (fieldData: any) => {
    setIsModalDeleteItemOpen(true)
    setSelectedItem(fieldData)
  }

  const handleClickCancelDeleteItem = () => {
    setIsModalDeleteItemOpen(false)
    setSelectedItem({ id: 0, item_id: 0 })
  }

  const handleClickSubmitDeleteItem = () => {
    handleClickCancelDeleteItem()
    setIsLoadingSubmit(true)

    const newItems = fields.items.filter((item: any) => item.id !== selectedItem.id)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        open: true,
        message: 'Berhasil menghapus barang.',
      })
      setFields((prevState) => ({
        ...prevState,
        items: newItems,
      }))
    }, 500)
  }

  const handleAddItem = () => {
    setFields((prevState: any) => ({
      ...prevState,
      items: [
        ...prevState.items,
        {
          id: 0,
          item_id: 0,
          qty: 0,
          unit: '',
        },
      ],
    }))
  }

  const handleChangePage = (pageNumber: number) => {
    setIsLoadingData(true)
    setTimeout(() => {
      setIsLoadingData(false)
      setPage(pageNumber - 1)
    }, 500)
  }

  const handleChangeField = (fieldName: string, value: string | number) => {
    setFields((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }))
  }

  const handleChangeNumericField = (fieldName: string, value: string) => {
    if (/^\d*$/.test(value) || value === '') {
      handleChangeField(fieldName, value)
    }
  }

  const handleChangeItemField = (fieldIndex: number, fieldName: string, value: string | number) => {
    setFields((prevState) => ({
      ...prevState,
      items: (prevState.items as any).map((item: any, index: number) => ({
        ...item,
        [fieldName]: index === fieldIndex ? value : item[fieldName],
      })),
    }))
  }

  const handleChangeNumericItemField = (fieldIndex: number, fieldName: string, value: string) => {
    if (/^\d*$/.test(value) || value === '') {
      setFields((prevState) => ({
        ...prevState,
        items: (prevState.items as any).map((item: any, index: number) => ({
          ...item,
          [fieldName]: index === fieldIndex ? value : item[fieldName],
        })),
      }))
    }
  }

  const handleChangeFilterField = (fieldName: string, value: string | number) => {
    setFilter((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }))
  }

  const handleClickConfirm = (type: string) => {
    setModalForm((prevState) => ({
      ...prevState,
      open: false,
    }))
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE[type].title,
      description: MODAL_CONFIRM_TYPE[type].description,
      open: true,
    })
    setSubmitType(type)
  }

  const handleClickSubmit = () => {
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      handleModalFormClose()
      setToast({
        open: true,
        message: MODAL_CONFIRM_TYPE[submitType].message,
      })
    }, 500)
  }

  const handleSubmitFilter = () => {
    setIsLoadingData(true)
    handleModalFilterClose()
    setTimeout(() => {
      setIsLoadingData(false)
    }, 500)
  }

  const tableDatas = TABLE_DATA.map((column) => ({
    id: column.id,
    request_no: column.request_no,
    department_name: column.department_name,
    type: ITEM_REQUEST_TYPE.find((type) => type.id === column.type)?.label,
    created_by: column.created_by,
    approved_by: column.approved_by,
    issued_by: column.issued_by,
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        <Popover content="Ubah">
          <Button variant="primary" size="sm" icon onClick={() => handleModalUpdateOpen(column)}>
            <IconEdit className="w-4 h-4" />
          </Button>
        </Popover>
        <Popover content="Hapus">
          <Button variant="danger" size="sm" icon onClick={() => handleModalDeleteOpen(column)}>
            <IconTrash className="w-4 h-4" />
          </Button>
        </Popover>
      </div>
    ),
  }))

  useEffect(() => {
    if (debounceSearch) {
      setIsLoadingData(true)
      setTimeout(() => {
        setIsLoadingData(false)
        const newData = tableDatas.filter(
          (tableData) => tableData.request_no.toLowerCase().includes(debounceSearch.toLowerCase())
          || tableData.department_name.toLowerCase().includes(debounceSearch.toLowerCase()),
        )
        setData(newData)
      }, 500)
    } else {
      setIsLoadingData(true)
      setTimeout(() => {
        setIsLoadingData(false)
        setData(tableDatas)
      }, 500)
    }
  }, [debounceSearch])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input placeholder="Cari no. permintaan, departemen" onChange={(e) => setSearch(e.target.value)} fullWidth />
            </div>
            <Button onClick={handleModalFilterOpen} variant="secondary">Filter</Button>
            <div className="sm:ml-auto flex gap-1">
              <Button onClick={handleExportExcel} variant="warning">Export</Button>
              <Button onClick={handleModalCreateOpen}>Tambah</Button>
            </div>
          </div>

          <Table
            tableHeaders={TABLE_HEADERS}
            tableData={paginateTableData}
            total={TABLE_DATA.length}
            page={page + 1}
            limit={PAGE_SIZE}
            onChangePage={handleChangePage}
            isLoading={isLoadingData}
          />
        </div>
      </div>

      <Modal open={modalForm.open} title={modalForm.title}>
        <form autoComplete="off" className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          <Select
            placeholder="Jenis Permintaan"
            label="Jenis Permintaan"
            name="type"
            value={fields.type}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Jenis Permintaan',
              value: '',
              disabled: true,
            },
            ...ITEM_REQUEST_TYPE.map((type) => ({ value: type.id, label: type.label }))]}
          />

          <Autocomplete
            placeholder="Departemen"
            label="Departemen"
            name="department_id"
            items={DEPARTMENT_DATA.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: DEPARTMENT_DATA.find((itemData) => itemData.id === fields.department_id)?.name || '',
              value: DEPARTMENT_DATA.find((itemData) => itemData.id === fields.department_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('department_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Select
            placeholder="Status"
            label="Status"
            name="status"
            value={fields.status}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Status',
              value: '',
              disabled: true,
            },
            {
              label: 'Ditolak',
              value: 1,
            },
            {
              label: 'Diterima',
              value: 2,
            }]}
          />

          <div className="sm:col-span-2">
            <p className="text-sm text-slate-600 font-medium mb-2">Barang</p>
            <Button size="sm" variant="secondary" onClick={handleAddItem}>Tambah</Button>

            <div className="border border-slate-200 dark:border-slate-700 rounded-md w-full overflow-scroll mt-2">
              <table className="border-collapse min-w-full w-max relative">
                <thead>
                  <tr className="text-center font-semibold text-slate-600 dark:text-white">
                    <td className="p-2">Nama Barang</td>
                    <td className="p-2">Jumlah</td>
                    <td className="p-2">Satuan</td>
                    <td className="p-2" aria-label="action" />
                  </tr>
                </thead>
                <tbody>
                  {fields.items.length ? (
                    fields.items.map((item: any, index: number) => (
                      <tr key={item.id} className="text-center font-regular text-slate-500 dark:text-white odd:bg-sky-50 dark:odd:bg-sky-900">
                        <td className="p-2" aria-label="Item Name">
                          <Autocomplete
                            name="item_id"
                            placeholder="Cari Barang"
                            items={ITEM_LIST.map((itemData) => ({
                              label: itemData.name,
                              value: itemData.id,
                            }))}
                            value={{
                              label: ITEM_LIST.find((itemData) => itemData.id === item.item_id)?.name || '',
                              value: ITEM_LIST.find((itemData) => itemData.id === item.item_id)?.id || '',
                            }}
                            onChange={(value) => handleChangeItemField(index, 'item_id', value.value)}
                            readOnly={modalForm.readOnly}
                            fullWidth
                          />
                        </td>
                        <td className="p-2" aria-label="Qty">
                          <Input
                            value={item.qty}
                            name="qty"
                            onChange={(e) => handleChangeNumericItemField(index, e.target.name, e.target.value)}
                            readOnly={modalForm.readOnly}
                            fullWidth
                          />
                        </td>
                        <td className="p-2" aria-label="Unit">
                          <Autocomplete
                            name="unit"
                            placeholder="Satuan"
                            items={ITEM_UNITS.map((itemData) => ({
                              label: itemData,
                              value: itemData,
                            }))}
                            value={{
                              label: ITEM_UNITS.find((itemData) => itemData === item.unit) || '',
                              value: ITEM_UNITS.find((itemData) => itemData === item.unit) || '',
                            }}
                            onChange={(value) => handleChangeItemField(index, 'unit', value.value)}
                            readOnly={modalForm.readOnly}
                            fullWidth
                          />
                        </td>
                        <td className="p-2 w-fit" aria-label="Item Action">
                          <Button variant="danger" size="sm" icon onClick={() => handleModalDeleteItemOpen(item)}>
                            <IconTrash className="text-white" width={16} height={16} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-center font-regular text-slate-500 dark:text-white">
                      <td className="p-2 text-center" colSpan={4}>
                        Belum Ada Barang
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">Tutup</Button>
          {!modalForm.readOnly && (
            <Button onClick={() => handleClickConfirm(fields.id ? 'update' : 'create')}>Kirim</Button>
          )}
        </div>
      </Modal>

      <Modal open={isModalFilterOpen} title="Filter" size="xs">
        <form autoComplete="off" className="grid grid-cols-1 gap-4 p-6">

          <div className="flex flex-col gap-2 w-full">
            <p className="text-sm font-medium text-slate-600 dark:text-white">Tanggal Permintaan</p>
            <div className="flex flex-col gap-1">
              <DatePicker
                placeholder="Tanggal Awal"
                name="start_date"
                value={filter.start_date ? dayjs(filter.start_date).toDate() : undefined}
                onChange={(selectedDate) => handleChangeFilterField('start_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
                readOnly={modalForm.readOnly}
                fullWidth
              />

              <DatePicker
                placeholder="Tanggal Akhir"
                name="end_date"
                value={filter.end_date ? dayjs(filter.end_date).toDate() : undefined}
                onChange={(selectedDate) => handleChangeFilterField('end_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
                readOnly={modalForm.readOnly}
                fullWidth
              />
            </div>
          </div>

        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFilterClose} variant="default">Tutup</Button>
          <Button onClick={handleSubmitFilter}>Kirim</Button>
        </div>
      </Modal>

      <Modal open={modalConfirm.open} title={modalConfirm.title} size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">{modalConfirm.description}</p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalConfirmClose} variant="default">Kembali</Button>
          <Button onClick={handleClickSubmit}>Kirim</Button>
        </div>
      </Modal>

      <Modal open={isModalDeleteItemOpen} title="Hapus Barang" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">Apa anda yakin ingin menghapus barang?</p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeleteItem} variant="default">Kembali</Button>
          <Button onClick={handleClickSubmitDeleteItem}>Ya</Button>
        </div>
      </Modal>

      {isLoadingSubmit && (
        <LoadingOverlay />
      )}

      <Toast open={toast.open} message={toast.message} onClose={handleCloseToast} />

    </Layout>
  )
}

export default PageItemRequest
