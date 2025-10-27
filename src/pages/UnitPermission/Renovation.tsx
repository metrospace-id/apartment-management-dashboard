import dayjs from 'dayjs'
import html2canvas from 'html2canvas'
import JSPDF from 'jspdf'
import { useState, useRef, useEffect } from 'react'
import QRCode from 'react-qr-code'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Autocomplete from 'components/Form/Autocomplete'
import DatePicker from 'components/Form/DatePicker'
import Input from 'components/Form/Input'
import TextArea from 'components/Form/TextArea'
import {
  Edit as IconEdit, TrashAlt as IconTrash, FileText as IconFile, Book as IconPrint,
} from 'components/Icons'
import Layout from 'components/Layout'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import Popover from 'components/Popover'
import type { TableHeaderProps } from 'components/Table/Table'
import Table from 'components/Table/Table'
import Toast from 'components/Toast'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE, DOCUMENT_DEFAULT } from 'constants/form'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'
import { exportToExcel } from 'utils/export'

const PAGE_NAME = 'Izin Renovasi'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No Unit',
    key: 'unit_code'
  },
  {
    label: 'Nama Pemohon',
    key: 'requester_name'
  },
  {
    label: 'Total Pekerja',
    key: 'total_workers'
  },
  {
    label: 'Jenis Renovasi',
    key: 'renovation_category'
  },
  {
    label: 'Tanggal Mulai',
    key: 'start_date'
  },
  {
    label: 'Tanggal Selsai',
    key: 'end_date'
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true
  }
]

const PageRenovation = () => {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0
  })
  const [dataUnits, setDataUnits] = useState<
    {
      unit_id: number
      unit_code: string
      owner_name: string
      owner_phone: string
      name: string
      phone: string
    }[]
  >([])
  const [dataCategories, setDataCategories] = useState<
    { id: number; name: string }[]
  >([])
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState({
    id: 0,
    unit_id: 0,
    unit_code: '',
    requester_name: '',
    requester_phone: '',
    contractor_name: '',
    total_workers: 0,
    pic_name: '',
    pic_phone: '',
    supervisor_name: '',
    supervisor_phone: '',
    renovation_category_id: 0,
    renovation_description: '',
    start_date: dayjs().format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
    created_at: ''
  })
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    renovation_category_id: 0
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
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
  const [documentPrint, setDocumentPrint] =
    useState<DocumentProps>(DOCUMENT_DEFAULT)
  const [isModalPrintOpen, setIsModalPrintOpen] = useState(false)
  const documentPdfRef = useRef<HTMLDivElement | null>(null)

  const debounceSearch = useDebounce(search, 500, () => setPage(1))

  const handleExportExcel = () => {
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      exportToExcel(data.data, PAGE_NAME)
    }, 500)
  }

  const handleCloseToast = () => {
    setToast({
      open: false,
      message: ''
    })
  }

  const handleModalPrintOpen = (fieldData: any) => {
    setIsModalPrintOpen(true)
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      unit_code: fieldData.unit_code,
      unit_id: fieldData.unit_id,
      requester_name: fieldData.requester_name,
      requester_phone: fieldData.requester_phone,
      contractor_name: fieldData.contractor_name,
      total_workers: fieldData.total_workers,
      pic_name: fieldData.pic_name,
      pic_phone: fieldData.pic_phone,
      supervisor_name: fieldData.supervisor_name,
      supervisor_phone: fieldData.supervisor_phone,
      renovation_category_id: fieldData.renovation_category_id,
      renovation_description: fieldData.renovation_description,
      start_date: fieldData.start_date,
      end_date: fieldData.end_date,
      created_at: fieldData.created_at
    }))
  }

  const handleModalPrintClose = () => {
    setIsModalPrintOpen(false)
  }

  const handlePrintDocument = () => {
    if (documentPdfRef.current) {
      html2canvas(documentPdfRef.current).then((canvas) => {
        const pdf = new JSPDF()
        const imgProperties = pdf.getImageProperties(canvas)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight =
          (imgProperties.height * pdfWidth) / imgProperties.width

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
      unit_id: 0,
      unit_code: '',
      requester_name: '',
      requester_phone: '',
      contractor_name: '',
      total_workers: 0,
      pic_name: '',
      pic_phone: '',
      supervisor_name: '',
      supervisor_phone: '',
      renovation_category_id: 0,
      renovation_description: '',
      start_date: dayjs().format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
      created_at: ''
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
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      unit_id: fieldData.unit_id,
      requester_name: fieldData.requester_name,
      requester_phone: fieldData.requester_phone,
      contractor_name: fieldData.contractor_name,
      total_workers: fieldData.total_workers,
      pic_name: fieldData.pic_name,
      pic_phone: fieldData.pic_phone,
      supervisor_name: fieldData.supervisor_name,
      supervisor_phone: fieldData.supervisor_phone,
      renovation_category_id: fieldData.renovation_category_id,
      renovation_description: fieldData.renovation_description,
      start_date: fieldData.start_date,
      end_date: fieldData.end_date
    }))
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setModalForm({
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      unit_id: fieldData.unit_id,
      requester_name: fieldData.requester_name,
      requester_phone: fieldData.requester_phone,
      contractor_name: fieldData.contractor_name,
      total_workers: fieldData.total_workers,
      pic_name: fieldData.pic_name,
      pic_phone: fieldData.pic_phone,
      supervisor_name: fieldData.supervisor_name,
      supervisor_phone: fieldData.supervisor_phone,
      renovation_category_id: fieldData.renovation_category_id,
      renovation_description: fieldData.renovation_description,
      start_date: fieldData.start_date,
      end_date: fieldData.end_date
    }))
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

  const handleChangeUnitField = (fieldName: string, value: string | number) => {
    const requester = dataUnits.find((unit) => unit.unit_id === value)
    const requesterName = requester?.owner_name || requester?.name
    const requesterPhone = requester?.owner_phone || requester?.phone

    setFields((prevState) => ({
      ...prevState,
      requester_name: requesterName || '',
      requester_phone: requesterPhone || '',
      [fieldName]: value
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

  const handleGetRenovations = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/renovation',
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

  const handleGetAllUnits = () => {
    api({
      url: '/v1/tenant/unit',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999
      }
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataUnits(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
  }

  const handleGetAllWorkCategories = () => {
    api({
      url: '/v1/renovation-category',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999
      }
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataCategories(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
  }

  const handleGetDocumentPrint = () => {
    api({
      url: '/v1/document/2',
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
          open: true,
          message: error.response?.data?.message
        })
      })
  }

  const apiSubmitCreate = () =>
    api({
      url: '/v1/renovation/create',
      withAuth: true,
      method: 'POST',
      data: fields
    })

  const apiSubmitUpdate = () =>
    api({
      url: `/v1/renovation/${fields.id}`,
      withAuth: true,
      method: 'PUT',
      data: fields
    })

  const apiSubmitDelete = () =>
    api({
      url: `/v1/renovation/${fields.id}`,
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
        handleGetRenovations()
        handleModalFormClose()
        setToast({
          open: true,
          message: MODAL_CONFIRM_TYPE[submitType].message
        })
      })
      .catch((error) => {
        handleModalConfirmClose()
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  const handleSubmitFilter = () => {
    handleGetRenovations()
    handleModalFilterClose()
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    unit_code: column.unit_code,
    requester_name: column.requester_name,
    contractor_name: column.contractor_name,
    total_workers: column.total_workers,
    renovation_category: column.renovation_category_name,
    renovation_category_id: column.renovation_category_id,
    start_date: dayjs(column.start_date).format('YYYY-MM-DD'),
    end_date: dayjs(column.end_date).format('YYYY-MM-DD'),
    description: column.description,
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
        {userPermissions.includes('unit-permission-renovation-edit') && (
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
        {userPermissions.includes('unit-permission-renovation-print') && (
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
        {userPermissions.includes('unit-permission-renovation-delete') && (
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
    handleGetRenovations()
  }, [debounceSearch, page])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser.permissions) {
        setUserPermissions(localStorageUser.permissions)
      }
    }, 500)

    handleGetAllUnits()
    handleGetAllWorkCategories()
    handleGetDocumentPrint()
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input
                placeholder="Cari nama, no. unit"
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
          <Autocomplete
            placeholder="Nomor Unit"
            label="Nomor Unit"
            name="unit_id"
            items={dataUnits.map((itemData) => ({
              label: itemData.unit_code,
              value: itemData.unit_id
            }))}
            value={{
              label:
                dataUnits.find(
                  (itemData) => itemData.unit_id === fields.unit_id
                )?.unit_code || '',
              value:
                dataUnits.find(
                  (itemData) => itemData.unit_id === fields.unit_id
                )?.unit_id || ''
            }}
            onChange={(value) => handleChangeUnitField('unit_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nama Pemohon"
            label="Nama Pemohon"
            name="requester_name"
            value={fields.requester_name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            disabled
            fullWidth
          />

          <Input
            placeholder="Nama Kontraktor"
            label="Nama Kontraktor"
            name="contractor_name"
            value={fields.contractor_name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Jumlah Pekerja"
            label="Jumlah Pekerja"
            name="total_workers"
            type="tel"
            value={(+fields.total_workers).toLocaleString()}
            onChange={(e) =>
              handleChangeNumericField(
                e.target.name,
                e.target.value.replace(/\W+/g, '')
              )
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nama Penanggung Jawab"
            label="Nama Penanggung Jawab"
            name="pic_name"
            value={fields.pic_name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Telepon Penanggung Jawab"
            label="No. Telepon Penanggung Jawab"
            name="pic_phone"
            type="tel"
            value={fields.pic_phone}
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nama Pengawas"
            label="Nama Pengawas"
            name="supervisor_name"
            value={fields.supervisor_name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Telepon Pengawas"
            label="No. Telepon Pengawas"
            name="supervisor_phone"
            type="tel"
            value={fields.supervisor_phone}
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Mulai"
            placeholder="Tanggal Mulai"
            name="start_date"
            value={
              fields.start_date ? dayjs(fields.start_date).toDate() : undefined
            }
            onChange={(selectedDate) =>
              handleChangeField(
                'start_date',
                dayjs(selectedDate).format('YYYY-MM-DD')
              )
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Selesai"
            placeholder="Tanggal Selesai"
            name="end_date"
            value={
              fields.end_date ? dayjs(fields.end_date).toDate() : undefined
            }
            onChange={(selectedDate) =>
              handleChangeField(
                'end_date',
                dayjs(selectedDate).format('YYYY-MM-DD')
              )
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Jenis Renovasi"
            label="Jenis Renovasi"
            name="renovation_category_id"
            items={dataCategories.map((itemData) => ({
              label: itemData.name,
              value: itemData.id
            }))}
            value={{
              label:
                dataCategories.find(
                  (itemData) => itemData.id === fields.renovation_category_id
                )?.name || '',
              value:
                dataCategories.find(
                  (itemData) => itemData.id === fields.renovation_category_id
                )?.id || ''
            }}
            onChange={(value) =>
              handleChangeField('renovation_category_id', value.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <TextArea
            placeholder="Deskripsi Renovasi"
            label="Deskripsi Renovasi"
            name="renovation_description"
            value={fields.renovation_description}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">
            Tutup
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
              Tanggal Mulai
            </p>
            <div className="flex flex-col gap-1">
              <DatePicker
                placeholder="Tanggal Mulai"
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
                readOnly={modalForm.readOnly}
                fullWidth
              />

              <DatePicker
                placeholder="Tanggal Selesai"
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
                readOnly={modalForm.readOnly}
                fullWidth
              />
            </div>
          </div>

          <Autocomplete
            placeholder="Jenis Renovasi"
            label="Jenis Renovasi"
            name="renovation_category_id"
            items={dataCategories.map((itemData) => ({
              label: itemData.name,
              value: itemData.id
            }))}
            value={{
              label:
                dataCategories.find(
                  (itemData) => itemData.id === filter.renovation_category_id
                )?.name || '',
              value:
                dataCategories.find(
                  (itemData) => itemData.id === filter.renovation_category_id
                )?.id || ''
            }}
            onChange={(value) =>
              handleChangeFilterField('renovation_category_id', value.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
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
                      <p className="text-xxs font-normal">{`Unit: ${fields.unit_code}`}</p>
                      <p className="text-xxs font-normal">{`Tanggal Keluar: ${dayjs(fields.start_date).format('DD MMMM YYYY')}`}</p>
                    </div>

                    <div className="flex flex-col text-right text-xs">
                      <p className="text-xs font-semibold">Pemohon</p>
                      <p className="text-xxs font-normal">
                        {fields.requester_name}
                      </p>
                      <p className="text-xxs font-normal">
                        {fields.requester_phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center whitespace-pre-line">
                  <div className="flex flex-col text-left gap-2">
                    <p className="text-xxs font-normal">{`Jenis Renovasi: ${dataCategories.find((itemData) => itemData.id === fields.renovation_category_id)?.name || ''}`}</p>

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
        onClose={handleCloseToast}
      />
    </Layout>
  )
}

export default PageRenovation
