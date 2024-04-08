import {
  useState, useMemo, useEffect,
} from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

import Badge from 'components/Badge'
import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Table from 'components/Table/Table'
import Button from 'components/Button'
import Modal from 'components/Modal'
import Input from 'components/Form/Input'
import Popover from 'components/Popover'
import {
  Edit as IconEdit, TrashAlt as IconTrash, FileText as IconFile, Cart as IconCart,
} from 'components/Icons'
import type { TableHeaderProps } from 'components/Table/Table'
import useDebounce from 'hooks/useDebounce'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Toast from 'components/Toast'
import Autocomplete from 'components/Form/Autocomplete'
import DatePicker from 'components/Form/DatePicker'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import { exportToExcel } from 'utils/export'
import { ITEM_REQUEST_TYPE, ITEM_UNITS, ITEM_REQUEST_STATUS } from 'constants/item'
import Select from 'components/Form/Select'
import api from 'utils/api'
import Toggle from 'components/Form/Toggle'

const PAGE_NAME = 'Permintaan Barang'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No. Permintaan',
    key: 'request_number',
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
    label: 'Status',
    key: 'status',
  },
  {
    label: 'Dibuat Oleh',
    key: 'created_by_name',
  },
  {
    label: 'Disetujui Oleh',
    key: 'approved_by_name',
  },
  {
    label: 'Dikeluarkan Oleh',
    key: 'issued_by_name',
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true,
  },
]

const renderStatusLabel = (status: number) => {
  const statusData = ITEM_REQUEST_STATUS.find((itemData) => itemData.id === status)
  const label = statusData?.label || '-'

  let variant = 'default'
  if (+status === 1) {
    variant = 'warning'
  }
  if (+status === 2) {
    variant = 'info'
  }
  if (+status === 3) {
    variant = 'success'
  }
  if (+status === 0) {
    variant = 'danger'
  }
  return {
    label,
    variant,
  }
}

interface FieldProps {
  id?: number
  type: string
  department_id: number | null
  status: string
  items: {
    id?: number
    item_stock_id: number
    quantity: number
    unit: string
  }[]
}

function PageItemRequest() {
  const navigate = useNavigate()
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  })
  const [dataDepartments, setDataDepartments] = useState<{ id: number, name: string }[]>([])
  const [dataItems, setDataItems] = useState<{ id: number, name: string }[]>([])
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState<FieldProps>({
    id: 0,
    type: '',
    department_id: null,
    status: '',
    items: [],
  })
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    status: '',
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    variant: 'default',
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
  const [selectedItem, setSelectedItem] = useState({ id: 0, item_stock_id: 0 })
  const [currentStatus, setCurrentStatus] = useState(0)

  const debounceSearch = useDebounce(search, 500, () => setPage(1))

  const statuses = useMemo(() => {
    if (+currentStatus === 2) {
      return ITEM_REQUEST_STATUS.filter((status) => status.id === 3)
    }
    return ITEM_REQUEST_STATUS.filter((status) => status.id !== 3)
  }, [currentStatus])

  const handleExportExcel = () => {
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      exportToExcel(data.data, PAGE_NAME)
    }, 500)
  }

  const handleCloseToast = () => {
    setToast({
      variant: 'default',
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
      type: '',
      department_id: null,
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
    setIsLoadingData(true)
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true,
    })
    api({
      url: `/v1/item-request/${fieldData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      setFields((prevState) => ({
        ...prevState,
        ...responseData.data,
      }))
      setCurrentStatus(+responseData.data.status)
      setIsLoadingData(false)
    })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setIsLoadingData(true)
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    api({
      url: `/v1/item-request/${fieldData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      setFields((prevState) => ({
        ...prevState,
        ...responseData.data,
      }))
      setCurrentStatus(+responseData.data.status)
      setIsLoadingData(false)
    })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
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
    }))
  }

  const handleModalPurchaseOpen = (fieldData: any) => {
    setModalConfirm({
      title: 'Belanja barang pesanan',
      description: 'Barang pesanan akan dibuat menjadi pembelian',
      open: true,
    })
    setSubmitType('purchase')
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
    }))
  }

  const handleModalDeleteItemOpen = (fieldData: any) => {
    setIsModalDeleteItemOpen(true)
    setSelectedItem(fieldData)
  }

  const handleClickCancelDeleteItem = () => {
    setIsModalDeleteItemOpen(false)
    setSelectedItem({ id: 0, item_stock_id: 0 })
  }

  const handleClickSubmitDeleteItem = () => {
    handleClickCancelDeleteItem()
    setIsLoadingSubmit(true)

    const newItems = fields.items.filter((item: any) => item.id !== selectedItem.id)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        variant: 'default',
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
    const itemLength = fields.items.length
    setFields((prevState: any) => ({
      ...prevState,
      items: [
        ...prevState.items,
        {
          id: `temp-${itemLength + 1}`,
          item_stock_id: 0,
          quantity: 0,
          unit: '',
        },
      ],
    }))
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

  const handleGetItemRequests = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/item-request',
      withAuth: true,
      method: 'GET',
      params: {
        page,
        limit: PAGE_SIZE,
        search,
        ...filter,
      },
    })
      .then(({ data: responseData }) => {
        setData(responseData.data)
      })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleGetAllItems = () => {
    api({
      url: '/v1/item-stock',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
      },
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataItems(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message,
        })
      })
  }

  const handleGetAllDepartments = () => {
    api({
      url: '/v1/department',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
      },
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataDepartments(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message,
        })
      })
  }

  const apiSubmitCreate = () => api({
    url: '/v1/item-request/create',
    withAuth: true,
    method: 'POST',
    data: fields,
  })

  const apiSubmitUpdate = () => api({
    url: `/v1/item-request/${fields.id}`,
    withAuth: true,
    method: 'PUT',
    data: fields,
  })

  const apiSubmitDelete = () => api({
    url: `/v1/item-request/${fields.id}`,
    withAuth: true,
    method: 'DELETE',
  })

  const handleClickSubmit = () => {
    setIsLoadingSubmit(true)
    let apiSubmit = apiSubmitCreate
    if (submitType === 'update') {
      apiSubmit = apiSubmitUpdate
    } else if (submitType === 'delete') {
      apiSubmit = apiSubmitDelete
    } else if (submitType === 'purchase') {
      navigate(`/item/purchase?request_id=${fields.id}`)
    }

    apiSubmit().then(() => {
      handleGetItemRequests()
      handleModalFormClose()
      setToast({
        variant: 'default',
        open: true,
        message: MODAL_CONFIRM_TYPE[submitType].message,
      })
    })
      .catch((error) => {
        handleModalConfirmClose()
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  const handleSubmitFilter = () => {
    handleModalFilterClose()
    handleGetItemRequests()
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    request_number: column.request_number,
    department_name: column.department_name,
    type: <Badge variant={+column.type === 1 ? 'info' : 'primary'}>{ITEM_REQUEST_TYPE.find((type) => type.id === +column.type)?.label}</Badge>,
    status: <Badge variant={renderStatusLabel(column.status).variant as any}>{renderStatusLabel(column.status).label}</Badge>,
    created_by_name: column.created_by_name,
    approved_by_name: column.approved_by_name || '-',
    issued_by_name: column.issued_by_name || '-',
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        {userPermissions.includes('item-request-edit') && (
        <Popover content="Ubah">
          <Button variant="primary" size="sm" icon onClick={() => handleModalUpdateOpen(column)}>
            <IconEdit className="w-4 h-4" />
          </Button>
        </Popover>
        )}
        {+column.type === 2 && column.status > 1 && (
        <Popover content="Beli">
          <Button variant="primary" size="sm" icon onClick={() => handleModalPurchaseOpen(column)}>
            <IconCart className="w-4 h-4" />
          </Button>
        </Popover>
        )}
        {userPermissions.includes('item-request-delete') && (
        <Popover content="Hapus">
          <Button variant="danger" size="sm" icon onClick={() => handleModalDeleteOpen(column)}>
            <IconTrash className="w-4 h-4" />
          </Button>
        </Popover>
        )}
      </div>
    ),
  }))

  useEffect(() => {
    handleGetItemRequests()
  }, [debounceSearch, page])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser.permissions) {
        setUserPermissions(localStorageUser.permissions)
      }
    }, 500)

    handleGetAllItems()
    handleGetAllDepartments()
  }, [])

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
            tableData={tableDatas}
            total={data.total}
            page={data.page}
            limit={PAGE_SIZE}
            onChangePage={setPage}
            isLoading={isLoadingData}
          />
        </div>
      </div>

      <Modal open={modalForm.open} title={modalForm.title}>
        <form autoComplete="off" className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6" onSubmit={() => handleClickConfirm(fields.id ? 'update' : 'create')}>
          <Select
            placeholder="Jenis Permintaan"
            label="Jenis Permintaan"
            name="type"
            value={fields.type}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly || currentStatus > 1}
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
            items={dataDepartments.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: dataDepartments.find((itemData) => itemData.id === fields.department_id)?.name || '',
              value: dataDepartments.find((itemData) => itemData.id === fields.department_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('department_id', value.value)}
            readOnly={modalForm.readOnly || currentStatus > 1}
            fullWidth
          />

          {!!fields.id && currentStatus < 2 && (
            <Select
              placeholder="Status"
              label="Status"
              name="status"
              value={fields.status}
              onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly || currentStatus > 1}
              fullWidth
              options={[{
                label: 'Pilih Status',
                value: '',
                disabled: true,
              },
              ...statuses.map((status) => ({ value: status.id, label: status.label })),
              ]}
            />
          )}

          <div className="sm:col-span-2">
            <p className="text-sm text-slate-600 font-medium mb-2">Barang</p>
            {(!modalForm.readOnly && currentStatus < 2) && (
            <Button size="sm" variant="secondary" onClick={handleAddItem}>Tambah</Button>
            )}

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
                            name="item_stock_id"
                            placeholder="Cari Barang"
                            items={dataItems.filter((itemData) => !fields.items.find((fieldItem) => fieldItem.item_stock_id === itemData.id))
                              .map((itemData) => ({
                                label: itemData.name,
                                value: itemData.id,
                              }))}
                            value={{
                              label: dataItems.find((itemData) => itemData.id === item.item_stock_id)?.name || '',
                              value: dataItems.find((itemData) => itemData.id === item.item_stock_id)?.id || '',
                            }}
                            onChange={(value) => handleChangeItemField(index, 'item_stock_id', value.value)}
                            readOnly={modalForm.readOnly || currentStatus > 1}
                            fullWidth
                          />
                        </td>
                        <td className="p-2" aria-label="Qty">
                          <Input
                            name="quantity"
                            value={(+item.quantity).toLocaleString()}
                            onChange={(e) => handleChangeNumericItemField(index, e.target.name, e.target.value.replace(/\W+/g, ''))}
                            readOnly={modalForm.readOnly || currentStatus > 1}
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
                            readOnly={modalForm.readOnly || currentStatus > 1}
                            fullWidth
                          />
                        </td>
                        <td className="p-2 w-fit" aria-label="Item Action">
                          {(!modalForm.readOnly && currentStatus < 2) && (
                          <Button variant="danger" size="sm" icon onClick={() => handleModalDeleteItemOpen(item)}>
                            <IconTrash className="text-white" width={16} height={16} />
                          </Button>
                          )}
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

          {!!fields.id && +fields.type === 1 && currentStatus === 2 && (
          <Toggle label="Barang Telah Dikeluarkan" name="status" checked={+fields.status === 3} onChange={(e) => handleChangeField('status', e.target.checked ? '3' : '2')} />
          )}

        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">Tutup</Button>
          {(!modalForm.readOnly && currentStatus < 3) && (
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
                readOnly={modalForm.readOnly || currentStatus > 1}
                fullWidth
              />

              <DatePicker
                placeholder="Tanggal Akhir"
                name="end_date"
                value={filter.end_date ? dayjs(filter.end_date).toDate() : undefined}
                onChange={(selectedDate) => handleChangeFilterField('end_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
                readOnly={modalForm.readOnly || currentStatus > 1}
                fullWidth
              />
            </div>
          </div>

          <Select
            placeholder="Status"
            label="Status"
            name="status"
            value={filter.status}
            onChange={(e) => handleChangeFilterField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly || currentStatus > 1}
            fullWidth
            options={[{
              label: 'Pilih Status',
              value: '',
              disabled: true,
            },
            ...ITEM_REQUEST_STATUS.map((status) => ({ value: status.id, label: status.label })),
            ]}
          />

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

      <Toast open={toast.open} message={toast.message} variant={toast.variant} onClose={handleCloseToast} />

    </Layout>
  )
}

export default PageItemRequest
