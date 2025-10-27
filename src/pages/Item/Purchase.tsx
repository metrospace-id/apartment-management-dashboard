import dayjs from 'dayjs'
import html2canvas from 'html2canvas'
import JSPDF from 'jspdf'
import { useState, useMemo, useEffect, useRef } from 'react'
import QRCode from 'react-qr-code'
import { useNavigate } from 'react-router-dom'

import Badge from 'components/Badge'
import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Autocomplete from 'components/Form/Autocomplete'
import DatePicker from 'components/Form/DatePicker'
import Input from 'components/Form/Input'
import Select from 'components/Form/Select'
import TextArea from 'components/Form/TextArea'
import Toggle from 'components/Form/Toggle'
import {
  Edit as IconEdit,
  TrashAlt as IconTrash,
  FileText as IconFile,
  Book as IconPrint
} from 'components/Icons'
import Layout from 'components/Layout'
import Modal from 'components/Modal'
import Popover from 'components/Popover'
import Table from 'components/Table/Table'
import type { TableHeaderProps } from 'components/Table/Table'
import Toast from 'components/Toast'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE, DOCUMENT_DEFAULT } from 'constants/form'
import {
  ITEM_PURCHASE_TYPE,
  ITEM_UNITS,
  ITEM_PURCHASE_STATUS
} from 'constants/item'
import useDebounce from 'hooks/useDebounce'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import api from 'utils/api'
import { exportToExcel } from 'utils/export'
import useQuery from 'utils/url'

const PAGE_NAME = 'Pembelian Barang'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No. Pembelian',
    key: 'purchase_number'
  },
  {
    label: 'Tanggal',
    key: 'created_at'
  },
  {
    label: 'Nama Vendor',
    key: 'vendor_name'
  },
  {
    label: 'No. Telepon Vendor',
    key: 'vendor_phone'
  },
  {
    label: 'Jenis Pembelian',
    key: 'type'
  },
  {
    label: 'Status',
    key: 'status'
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true
  }
]

const renderStatusLabel = (status: number) => {
  const statusData = ITEM_PURCHASE_STATUS.find(
    (itemData) => itemData.id === status
  )
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
    variant
  }
}

interface FieldProps {
  id?: number
  type: string
  vendor_id: number | null
  vendor_name?: string
  vendor_phone?: string
  vendor_sector?: string
  department_id: number | null
  department_name?: string
  status: string
  notes: string
  items: {
    id?: number
    item_stock_id: number
    quantity: number
    price: number
    unit: string
  }[]
  created_at?: string
  created_by_name?: string
  subtotal?: number
  tax?: number
  taxAmount?: number
  discount?: number
  discountAmount?: number
  grandTotal?: number
}

const PageItemPurchase = () => {
  const query = useQuery()
  const navigate = useNavigate()
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0
  })
  const [dataDepartments, setDataDepartments] = useState<
    { id: number; name: string }[]
  >([])
  const [dataVendors, setDataVendors] = useState<
    { id: number; name: string; phone: string; sector: string }[]
  >([])
  const [dataItems, setDataItems] = useState<{ id: number; name: string }[]>([])
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState<FieldProps>({
    id: 0,
    vendor_id: null,
    department_id: null,
    type: '',
    status: '',
    notes: '',
    items: [],
    tax: 11,
    discount: 0
  })
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    status: ''
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    variant: 'default',
    open: false,
    message: ''
  })
  const [search, setSearch] = useState('')
  const [isModalFilterOpen, setIsModalFilterOpen] = useState(false)
  const [modalForm, setModalForm] = useState({
    title: '',
    open: false,
    readOnly: false
  })
  const [modalConfirm, setModalConfirm] = useState({
    title: '',
    description: '',
    open: false
  })
  const [submitType, setSubmitType] = useState('create')
  const [isModalDeleteItemOpen, setIsModalDeleteItemOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState({ id: 0, item_stock_id: 0 })
  const [currentStatus, setCurrentStatus] = useState(0)
  const [documentPrint, setDocumentPrint] =
    useState<DocumentProps>(DOCUMENT_DEFAULT)
  const [isModalPrintOpen, setIsModalPrintOpen] = useState(false)
  const documentPdfRef = useRef<HTMLDivElement | null>(null)

  const debounceSearch = useDebounce(search, 500, () => setPage(1))

  const subtotalItem =
    useMemo(
      () =>
        fields.items.reduce(
          (acc, item) => acc + +item.price * +item.quantity,
          0
        ),
      [fields.items]
    ) || 0
  const taxAmount =
    useMemo(
      () => (+(`${fields.tax}`.replace(/,/g, '.') || 0) / 100) * subtotalItem,
      [fields.tax, subtotalItem]
    ) || 0
  const discountAmount =
    useMemo(
      () =>
        (+(`${fields.discount}`.replace(/,/g, '.') || 0) / 100) * subtotalItem,
      [fields.discount, subtotalItem]
    ) || 0
  const grandTotal =
    useMemo(
      () => subtotalItem + taxAmount - discountAmount,
      [subtotalItem, taxAmount, discountAmount]
    ) || 0

  const statuses = useMemo(() => {
    if (+currentStatus === 2) {
      return ITEM_PURCHASE_STATUS.filter((status) => status.id === 3)
    }
    return ITEM_PURCHASE_STATUS.filter((status) => status.id !== 3)
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
      message: ''
    })
  }

  const handleModalPrintOpen = (fieldData: any) => {
    setIsModalPrintOpen(true)
    setIsLoadingData(true)
    api({
      url: `/v1/item-purchase/${fieldData.id}`,
      withAuth: true
    })
      .then(({ data: responseData }) => {
        setFields((prevState) => ({
          ...prevState,
          ...responseData.data,
          tax: responseData.data.tax
            ? `${responseData.data.tax}`.replace(/\./g, ',')
            : 0,
          discount: responseData.data.discount
            ? `${responseData.data.discount}`.replace(/\./g, ',')
            : 0
        }))
        setCurrentStatus(+responseData.data.status)
        setIsLoadingData(false)
      })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleModalPrintClose = () => {
    setIsModalPrintOpen(false)
  }

  const handlePrintDocument = () => {
    if (documentPdfRef.current) {
      html2canvas(documentPdfRef.current).then((canvas) => {
        const pdf = new JSPDF()
        const imgProperties = pdf.getImageProperties(canvas)
        const pdfWidth = imgProperties.width
        const pdfHeight = imgProperties.height

        pdf.addImage(canvas, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`${PAGE_NAME}.pdf`)
      })
    }
  }

  const handleModalFormClose = () => {
    setModalForm({
      title: '',
      open: false,
      readOnly: false
    })
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false
    }))
    setFields({
      id: 0,
      vendor_id: null,
      department_id: null,
      type: '',
      status: '',
      notes: '',
      items: []
    })

    if (query.get('request_id')) {
      navigate('/item/purchase')
    }
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
        open: true
      }))
    }
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false
    }))
  }

  const handleModalCreateOpen = () => {
    setModalForm({
      title: `Tambah ${PAGE_NAME} Baru`,
      open: true,
      readOnly: false
    })
  }

  const handleModalDetailOpen = (fieldData: any) => {
    setIsLoadingData(true)
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true
    })
    api({
      url: `/v1/item-purchase/${fieldData.id}`,
      withAuth: true
    })
      .then(({ data: responseData }) => {
        setFields((prevState) => ({
          ...prevState,
          ...responseData.data,
          tax: responseData.data.tax
            ? `${responseData.data.tax}`.replace(/\./g, ',')
            : 0,
          discount: responseData.data.discount
            ? `${responseData.data.discount}`.replace(/\./g, ',')
            : 0
        }))
        setCurrentStatus(+responseData.data.status)
        setIsLoadingData(false)
      })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setIsLoadingData(true)
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: false
    })
    api({
      url: `/v1/item-purchase/${fieldData.id}`,
      withAuth: true
    })
      .then(({ data: responseData }) => {
        setFields((prevState) => ({
          ...prevState,
          ...responseData.data,
          tax: responseData.data.tax
            ? `${responseData.data.tax}`.replace(/\./g, ',')
            : 0,
          discount: responseData.data.discount
            ? `${responseData.data.discount}`.replace(/\./g, ',')
            : 0
        }))
        setCurrentStatus(+responseData.data.status)
        setIsLoadingData(false)
      })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleModalDeleteOpen = (fieldData: any) => {
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE.delete.title,
      description: MODAL_CONFIRM_TYPE.delete.description,
      open: true
    })
    setSubmitType('delete')
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id
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

    const newItems = fields.items.filter(
      (item: any) => item.id !== selectedItem.id
    )
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        variant: 'default',
        open: true,
        message: 'Berhasil menghapus barang.'
      })
      setFields((prevState) => ({
        ...prevState,
        items: newItems
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
          price: 0,
          unit: ''
        }
      ]
    }))
  }

  const handleChangeField = (fieldName: string, value: string | number) => {
    setFields((prevState) => ({
      ...prevState,
      [fieldName]: value
    }))
  }

  const handleChangeNumericField = (fieldName: string, value: string) => {
    if (/^\d*$/.test(value) || value === '') {
      handleChangeField(fieldName, value)
    }
  }

  const handleChangeNumericDecimalField = (
    fieldName: string,
    value: string
  ) => {
    if (/^(?:\d+(,?(\d+)?))$/.test(value) || value === '') {
      handleChangeField(fieldName, value)
    }
  }

  const handleChangeItemField = (
    fieldIndex: number,
    fieldName: string,
    value: string | number
  ) => {
    setFields((prevState) => ({
      ...prevState,
      items: (prevState.items as any).map((item: any, index: number) => ({
        ...item,
        [fieldName]: index === fieldIndex ? value : item[fieldName]
      }))
    }))
  }

  const handleChangeNumericItemField = (
    fieldIndex: number,
    fieldName: string,
    value: string
  ) => {
    if (/^\d*$/.test(value) || value === '') {
      setFields((prevState) => ({
        ...prevState,
        items: (prevState.items as any).map((item: any, index: number) => ({
          ...item,
          [fieldName]: index === fieldIndex ? value : item[fieldName]
        }))
      }))
    }
  }

  const handleChangeVendorField = (vendorId: number) => {
    const selectedVendor = dataVendors.find(({ id }) => id === vendorId)
    setFields((prevState) => ({
      ...prevState,
      vendor_id: selectedVendor?.id || 0,
      vendor_name: selectedVendor?.name || '',
      vendor_phone: selectedVendor?.phone || '',
      vendor_sector: selectedVendor?.sector || ''
    }))
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

  const handleClickConfirm = (type: string) => {
    setModalForm((prevState) => ({
      ...prevState,
      open: false
    }))
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE[type].title,
      description: MODAL_CONFIRM_TYPE[type].description,
      open: true
    })
    setSubmitType(type)
  }

  const handleGetItemPurchases = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/item-purchase',
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
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleGetAllItems = () => {
    api({
      url: '/v1/item-stock',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999
      }
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
          message: error.response?.data?.message
        })
      })
  }

  const handleGetAllDepartments = () => {
    api({
      url: '/v1/department',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999
      }
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
          message: error.response?.data?.message
        })
      })
  }

  const handleGetAllVendors = () => {
    api({
      url: '/v1/vendor',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999
      }
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataVendors(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        })
      })
  }

  const handleGetDocumentPrint = () => {
    api({
      url: '/v1/document/6',
      withAuth: true,
      method: 'GET'
    })
      .then(({ data: responseData }) => {
        if (responseData.data.id) {
          setDocumentPrint(responseData.data)
        }
      })
      .catch((error) => {
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        })
      })
  }

  const apiSubmitCreate = () =>
    api({
      url: '/v1/item-purchase/create',
      withAuth: true,
      method: 'POST',
      data: {
        ...fields,
        tax: +(`${fields.tax}`.replace(/,/g, '.') || 0),
        discount: +(`${fields.discount}`.replace(/,/g, '.') || 0)
      }
    })

  const apiSubmitUpdate = () =>
    api({
      url: `/v1/item-purchase/${fields.id}`,
      withAuth: true,
      method: 'PUT',
      data: {
        ...fields,
        tax: +(`${fields.tax}`.replace(/,/g, '.') || 0),
        discount: +(`${fields.discount}`.replace(/,/g, '.') || 0)
      }
    })

  const apiSubmitDelete = () =>
    api({
      url: `/v1/item-purchase/${fields.id}`,
      withAuth: true,
      method: 'DELETE'
    })

  const handleClickSubmit = () => {
    setIsLoadingSubmit(true)
    let apiSubmit = apiSubmitCreate
    if (submitType === 'update') {
      apiSubmit = apiSubmitUpdate
    } else if (submitType === 'delete') {
      apiSubmit = apiSubmitDelete
    }

    apiSubmit()
      .then(() => {
        handleGetItemPurchases()
        handleModalFormClose()
        setToast({
          variant: 'default',
          open: true,
          message: MODAL_CONFIRM_TYPE[submitType].message
        })
      })
      .catch((error) => {
        handleModalConfirmClose()
        setToast({
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  const handleSubmitFilter = () => {
    handleModalFilterClose()
    handleGetItemPurchases()
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    purchase_number: column.purchase_number,
    created_at: dayjs(column.created_at).format('YYYY-MM-DD'),
    vendor_name: column.vendor_name,
    vendor_phone: column.vendor_phone,
    type: (
      <Badge variant={+column.type === 1 ? 'info' : 'primary'}>
        {ITEM_PURCHASE_TYPE.find((type) => type.id === +column.type)?.label}
      </Badge>
    ),
    status: (
      <Badge variant={renderStatusLabel(column.status).variant as any}>
        {renderStatusLabel(column.status).label}
      </Badge>
    ),
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button
            variant="primary"
            size="sm"
            icon
            onClick={() => handleModalDetailOpen(column)}
          >
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        {userPermissions.includes('item-purchase-edit') && (
          <Popover content="Ubah">
            <Button
              variant="primary"
              size="sm"
              icon
              onClick={() => handleModalUpdateOpen(column)}
            >
              <IconEdit className="w-4 h-4" />
            </Button>
          </Popover>
        )}
        {userPermissions.includes('item-purchase-print') && (
          <Popover content="Print">
            <Button
              variant="default"
              size="sm"
              icon
              onClick={() => handleModalPrintOpen(column)}
            >
              <IconPrint className="w-4 h-4" />
            </Button>
          </Popover>
        )}
        {userPermissions.includes('item-purchase-delete') && (
          <Popover content="Hapus">
            <Button
              variant="danger"
              size="sm"
              icon
              onClick={() => handleModalDeleteOpen(column)}
            >
              <IconTrash className="w-4 h-4" />
            </Button>
          </Popover>
        )}
      </div>
    )
  }))

  useEffect(() => {
    handleGetItemPurchases()
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
    handleGetAllVendors()
    handleGetDocumentPrint()
  }, [])

  useEffect(() => {
    if (query.get('request_id')) {
      setIsLoadingData(true)
      setModalForm({
        title: `Detail ${PAGE_NAME}`,
        open: true,
        readOnly: true
      })
      api({
        url: `/v1/item-request/${query.get('request_id')}`,
        withAuth: true
      })
        .then(({ data: responseData }) => {
          setFields((prevState) => ({
            ...prevState,
            item_request_id: responseData.data.id,
            department_id: responseData.data.department_id,
            items: responseData.data.items.map((item: any) => ({
              id: item.id,
              item_stock_id: item.item_stock_id,
              quantity: item.quantity,
              price: '',
              unit: item.unit
            }))
          }))
          setIsLoadingData(false)
        })
        .catch((error) => {
          setToast({
            variant: 'error',
            open: true,
            message: error.response?.data?.message
          })
        })
        .finally(() => {
          setIsLoadingData(false)
        })
      handleModalCreateOpen()
    }
  }, [query])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input
                placeholder="Cari no. pembelian, vendor"
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
        <form
          autoComplete="off"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6"
          onSubmit={() => handleClickConfirm(fields.id ? 'update' : 'create')}
        >
          <Select
            placeholder="Jenis Permintaan"
            label="Jenis Permintaan"
            name="type"
            value={fields.type}
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly || currentStatus > 1}
            fullWidth
            options={[
              {
                label: 'Pilih Jenis Permintaan',
                value: '',
                disabled: true
              },
              ...ITEM_PURCHASE_TYPE.map((type) => ({
                value: type.id,
                label: type.label
              }))
            ]}
          />

          <Autocomplete
            placeholder="Departemen"
            label="Departemen"
            name="department_id"
            items={dataDepartments.map((itemData) => ({
              label: itemData.name,
              value: itemData.id
            }))}
            value={{
              label:
                dataDepartments.find(
                  (itemData) => itemData.id === fields.department_id
                )?.name || '',
              value:
                dataDepartments.find(
                  (itemData) => itemData.id === fields.department_id
                )?.id || ''
            }}
            onChange={(value) =>
              handleChangeField('department_id', value.value)
            }
            readOnly={modalForm.readOnly || currentStatus > 1}
            fullWidth
          />

          <Autocomplete
            placeholder="Nama Vendor"
            label="Nama Vendor"
            name="vendor_id"
            items={dataVendors.map((itemData) => ({
              label: itemData.name,
              value: itemData.id
            }))}
            value={{
              label:
                dataVendors.find((itemData) => itemData.id === fields.vendor_id)
                  ?.name || '',
              value:
                dataVendors.find((itemData) => itemData.id === fields.vendor_id)
                  ?.id || ''
            }}
            onChange={(value) => handleChangeVendorField(+value.value)}
            readOnly={modalForm.readOnly || currentStatus > 1}
            fullWidth
          />

          <Input
            placeholder="No. Telepon Vendor"
            label="No. Telepon Vendor"
            value={fields.vendor_phone}
            readOnly
            fullWidth
          />

          <Input
            placeholder="Bidang"
            label="Bidang"
            value={fields.vendor_sector}
            readOnly
            fullWidth
          />

          <div className="sm:col-span-2">
            <TextArea
              placeholder="Catatan"
              label="Catatan"
              name="notes"
              value={fields.notes}
              readOnly={modalForm.readOnly || currentStatus > 1}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              fullWidth
            />
          </div>

          {!!fields.id && currentStatus < 2 && (
            <Select
              placeholder="Status"
              label="Status"
              name="status"
              value={fields.status}
              onChange={(e) =>
                handleChangeNumericField(e.target.name, e.target.value)
              }
              readOnly={modalForm.readOnly || currentStatus > 1}
              fullWidth
              options={[
                {
                  label: 'Pilih Status',
                  value: '',
                  disabled: true
                },
                ...statuses.map((status) => ({
                  value: status.id,
                  label: status.label
                }))
              ]}
            />
          )}

          <div className="sm:col-span-2">
            <p className="text-sm text-slate-600 font-medium mb-2">Barang</p>
            {!modalForm.readOnly &&
              currentStatus < 2 &&
              !query.get('request_id') && (
                <Button size="sm" variant="secondary" onClick={handleAddItem}>
                  Tambah
                </Button>
              )}
            <div className="border border-slate-200 dark:border-slate-700 rounded-md w-full overflow-scroll mt-2">
              <table className="border-collapse min-w-full w-max relative">
                <thead>
                  <tr className="text-center font-semibold text-slate-600 dark:text-white">
                    <td className="p-2">Nama Barang</td>
                    <td className="p-2">Jumlah</td>
                    <td className="p-2">Satuan</td>
                    <td className="p-2">Harga</td>
                    <td className="p-2">Sub Total</td>
                    <td className="p-2" aria-label="action" />
                  </tr>
                </thead>
                <tbody>
                  {fields.items.length ? (
                    fields.items.map((item: any, index: number) => (
                      <tr
                        key={item.id}
                        className="text-center font-regular text-slate-500 dark:text-white odd:bg-sky-50 dark:odd:bg-sky-900"
                      >
                        <td className="p-2" aria-label="Item Name">
                          <Autocomplete
                            name="item_stock_id"
                            placeholder="Cari Barang"
                            items={dataItems.map((itemData) => ({
                              label: itemData.name,
                              value: itemData.id
                            }))}
                            value={{
                              label:
                                dataItems.find(
                                  (itemData) =>
                                    itemData.id === item.item_stock_id
                                )?.name || '',
                              value:
                                dataItems.find(
                                  (itemData) =>
                                    itemData.id === item.item_stock_id
                                )?.id || ''
                            }}
                            onChange={(value) =>
                              handleChangeItemField(
                                index,
                                'item_stock_id',
                                value.value
                              )
                            }
                            readOnly={modalForm.readOnly || currentStatus > 1}
                            fullWidth
                          />
                        </td>
                        <td className="p-2" aria-label="Qty">
                          <Input
                            name="quantity"
                            value={(+item.quantity).toLocaleString('id')}
                            onChange={(e) =>
                              handleChangeNumericItemField(
                                index,
                                e.target.name,
                                e.target.value.replace(/\W+/g, '')
                              )
                            }
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
                              value: itemData
                            }))}
                            value={{
                              label:
                                ITEM_UNITS.find(
                                  (itemData) => itemData === item.unit
                                ) || '',
                              value:
                                ITEM_UNITS.find(
                                  (itemData) => itemData === item.unit
                                ) || ''
                            }}
                            onChange={(value) =>
                              handleChangeItemField(index, 'unit', value.value)
                            }
                            readOnly={modalForm.readOnly || currentStatus > 1}
                            fullWidth
                          />
                        </td>
                        <td className="p-2" aria-label="Price">
                          <Input
                            leftIcon={<p>Rp</p>}
                            name="price"
                            value={(+item.price).toLocaleString('id')}
                            onChange={(e) =>
                              handleChangeNumericItemField(
                                index,
                                e.target.name,
                                e.target.value.replace(/\W+/g, '')
                              )
                            }
                            readOnly={modalForm.readOnly || currentStatus > 1}
                            fullWidth
                          />
                        </td>
                        <td className="p-2" aria-label="Price">
                          <Input
                            leftIcon={<p>Rp</p>}
                            value={(
                              +item.price * +item.quantity
                            ).toLocaleString('id')}
                            disabled
                            fullWidth
                          />
                        </td>
                        <td className="p-2 w-fit" aria-label="Item Action">
                          {!modalForm.readOnly &&
                            currentStatus < 2 &&
                            !query.get('request_id') && (
                              <Button
                                variant="danger"
                                size="sm"
                                icon
                                onClick={() => handleModalDeleteItemOpen(item)}
                              >
                                <IconTrash
                                  className="text-white"
                                  width={16}
                                  height={16}
                                />
                              </Button>
                            )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-center font-regular text-slate-500 dark:text-white">
                      <td className="p-2 text-center" colSpan={6}>
                        Belum Ada Barang
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-2">
            <Input
              leftIcon={<p>Rp</p>}
              placeholder="Subtotal"
              label="Subtotal"
              value={(subtotalItem || '').toLocaleString('id')}
              readOnly
              fullWidth
            />
          </div>

          <Input
            rightIcon={<p>%</p>}
            placeholder="Pajak (%)"
            label="Pajak (%)"
            name="tax"
            maxLength={5}
            value={fields.tax || 11}
            onChange={(e) =>
              handleChangeNumericDecimalField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly || currentStatus > 1}
            fullWidth
          />

          <Input
            leftIcon={<p>Rp</p>}
            placeholder="Pajak"
            label="Pajak"
            value={taxAmount.toLocaleString('id')}
            readOnly
            fullWidth
          />

          <Input
            rightIcon={<p>%</p>}
            placeholder="Diskon (%)"
            label="Diskon (%)"
            name="discount"
            maxLength={5}
            value={fields.discount}
            onChange={(e) =>
              handleChangeNumericDecimalField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly || currentStatus > 1}
            fullWidth
          />

          <Input
            leftIcon={<p>Rp</p>}
            placeholder="Diskon"
            label="Diskon"
            value={discountAmount.toLocaleString('id')}
            readOnly
            fullWidth
          />

          <div className="col-span-2">
            <Input
              leftIcon={<p>Rp</p>}
              placeholder="Gran Total"
              label="Gran Total"
              value={(fields.grandTotal || grandTotal).toLocaleString('id')}
              readOnly
              fullWidth
            />
          </div>

          {!!fields.id && +fields.type === 1 && currentStatus === 2 && (
            <Toggle
              label="Barang Telah Diterima"
              name="status"
              checked={+fields.status === 3}
              onChange={(e) =>
                handleChangeField('status', e.target.checked ? '3' : '2')
              }
            />
          )}
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button
            onClick={
              query.get('request_id')
                ? () => navigate('/item/request')
                : handleModalFormClose
            }
            variant="default"
          >
            {query.get('request_id') ? 'Kembali' : 'Tutup'}
          </Button>
          {!modalForm.readOnly && (
            <Button
              onClick={() =>
                handleClickConfirm(fields.id ? 'update' : 'create')
              }
            >
              Kirim
            </Button>
          )}
        </div>
      </Modal>

      <Modal open={isModalFilterOpen} title="Filter" size="xs">
        <form autoComplete="off" className="grid grid-cols-1 gap-4 p-6">
          <div className="flex flex-col gap-2 w-full">
            <p className="text-sm font-medium text-slate-600 dark:text-white">
              Tanggal Pembelian
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
                readOnly={modalForm.readOnly || currentStatus > 1}
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
            onChange={(e) =>
              handleChangeFilterField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly || currentStatus > 1}
            fullWidth
            options={[
              {
                label: 'Pilih Status',
                value: '',
                disabled: true
              },
              ...ITEM_PURCHASE_STATUS.map((status) => ({
                value: status.id,
                label: status.label
              }))
            ]}
          />
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFilterClose} variant="default">
            Tutup
          </Button>
          <Button onClick={handleSubmitFilter}>Kirim</Button>
        </div>
      </Modal>

      <Modal open={modalConfirm.open} title={modalConfirm.title} size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">
            {modalConfirm.description}
          </p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalConfirmClose} variant="default">
            Kembali
          </Button>
          <Button onClick={handleClickSubmit}>Kirim</Button>
        </div>
      </Modal>

      <Modal open={isModalDeleteItemOpen} title="Hapus Barang" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">
            Apa anda yakin ingin menghapus barang?
          </p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeleteItem} variant="default">
            Kembali
          </Button>
          <Button onClick={handleClickSubmitDeleteItem}>Ya</Button>
        </div>
      </Modal>

      <Modal open={isModalPrintOpen} title={`Print ${PAGE_NAME}`} size="lg">
        <div className="flex-3 flex flex-col gap-4">
          <div className="bg-slate-100 rounded-md p-4 overflow-scroll h-full">
            <div
              className="bg-white p-4 text-slate-600 min-w-[800px] text-pr"
              ref={documentPdfRef}
            >
              <div className="whitespace-pre-line border-b-2 border-black flex items-center gap-4 min-h-20">
                <div className="w-[80px]">
                  {documentPrint.picture && (
                    <div className="relative">
                      <img
                        src={documentPrint.picture}
                        alt="doc"
                        className="w-[100px] h-[100px] object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="text-center flex-1">
                  <p className="font-semibold text-lg">
                    {documentPrint.header}
                  </p>
                  <p className="font-semibold text-xs">
                    {documentPrint.subheader}
                  </p>
                </div>
                <div className="w-[100px]" />
              </div>
              <div className="py-4 flex flex-col gap-4">
                <div className="text-center whitespace-pre-line">
                  <div className="flex justify-between">
                    <div className="flex flex-col text-left">
                      <p className="text-xs font-semibold">
                        {documentPrint.name}
                      </p>
                      <p className="text-xxs font-normal">
                        Divisi:&nbsp;
                        {fields.department_name}
                      </p>
                    </div>

                    <div className="flex flex-col text-right text-xs">
                      <p className="text-xs font-semibold">Pemohon</p>
                      <p className="text-xxs font-normal">
                        {fields.created_by_name}
                      </p>
                      {/* <p className="text-xxs font-normal">081xxxxxxxxx</p> */}
                    </div>
                  </div>
                </div>
                <div className="text-center whitespace-pre-line">
                  <div className="flex flex-col text-left gap-2">
                    <table className="w-full mb-4">
                      <thead>
                        <tr className="border-t-1 border-slate-300">
                          <td className="text-xxs font-semibold">No.</td>
                          <td className="text-xxs font-semibold">
                            Nama Barang
                          </td>
                          <td className="text-xxs font-semibold">Jumlah</td>
                          <td className="text-xxs font-semibold">Harga</td>
                          <td className="text-xxs font-semibold">Sub Total</td>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.items.map((item, index) => (
                          <tr
                            className="border-t-1 border-slate-300 last:border-b-0"
                            key={item.id}
                          >
                            <td className="text-xxs">{index + 1}</td>
                            <td className="text-xxs">
                              {dataItems.find(
                                (itemData) => itemData.id === item.item_stock_id
                              )?.name || ''}
                            </td>
                            <td className="text-xxs">
                              {(+item.quantity).toLocaleString('id')}
                            </td>
                            <td className="text-xxs">{`Rp ${(+item.price).toLocaleString('id')}`}</td>
                            <td className="text-xxs">{`Rp ${(+item.price * +item.quantity).toLocaleString('id')}`}</td>
                          </tr>
                        ))}
                        <tr className="border-t-1 border-slate-300 last:border-b-1">
                          <td
                            className="text-xxs"
                            colSpan={3}
                            aria-label="total"
                          />
                          <td className="text-xxs font-semibold">Total</td>
                          <td className="text-xxs font-semibold">
                            {`Rp ${subtotalItem.toLocaleString('id')}`}
                          </td>
                        </tr>
                        <tr className="border-t-1 border-slate-300 last:border-b-1">
                          <td
                            className="text-xxs"
                            colSpan={3}
                            aria-label="total"
                          />
                          <td className="text-xxs font-semibold">Diskon</td>
                          <td className="text-xxs font-semibold">
                            {`Rp ${discountAmount.toLocaleString('id')}`}
                          </td>
                        </tr>
                        <tr className="border-t-1 border-slate-300 last:border-b-1">
                          <td
                            className="text-xxs"
                            colSpan={3}
                            aria-label="total"
                          />
                          <td className="text-xxs font-semibold">{`PPN ${fields.tax}%`}</td>
                          <td className="text-xxs font-semibold">
                            {`Rp ${taxAmount.toLocaleString('id')}`}
                          </td>
                        </tr>
                        <tr className="border-t-1 border-slate-300 last:border-b-1">
                          <td
                            className="text-xxs"
                            colSpan={3}
                            aria-label="total"
                          />
                          <td className="text-xxs font-semibold">
                            Grand Total
                          </td>
                          <td className="text-xxs font-semibold">{`Rp ${grandTotal.toLocaleString('id')}`}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p className="text-xxs font-normal">
                      {documentPrint.content}
                    </p>
                  </div>
                </div>
                <div className="text-center whitespace-pre-line">
                  <div className="flex flex-col text-left gap-2">
                    <p className="text-xxs font-normal">
                      Jakarta,&nbsp;
                      {dayjs(fields.created_at).format('DD MMMM YYYY')}
                    </p>
                    <QRCode
                      style={{
                        height: 'auto',
                        maxWidth: '50px',
                        width: '50px'
                      }}
                      size={150}
                      value={window.location.href}
                      viewBox="0 0 150 150"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalPrintClose} variant="default">
            Tutup
          </Button>
          <Button onClick={handlePrintDocument}>Print</Button>
        </div>
      </Modal>

      {isLoadingSubmit && <LoadingOverlay />}

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={handleCloseToast}
      />
    </Layout>
  )
}

export default PageItemPurchase
