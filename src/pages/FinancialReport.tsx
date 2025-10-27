import { useState, useEffect, useRef } from 'react'
import 'react-quill/dist/quill.snow.css'
import dayjs from 'dayjs'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import DatePicker from 'components/Form/DatePicker'
import Input from 'components/Form/Input'
import {
  Edit as IconEdit,
  TrashAlt as IconTrash,
  FileText as IconFile
} from 'components/Icons'
import Layout from 'components/Layout'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import Popover from 'components/Popover'
import type { TableHeaderProps } from 'components/Table/Table'
import Table from 'components/Table/Table'
import Toast from 'components/Toast'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'
import { toBase64 } from 'utils/file'

const PAGE_NAME = 'Financial Report'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Tanggal',
    key: 'date'
  },
  {
    label: 'Penerimaan Iuran Listrik',
    key: 'incoming_electricity_charge'
  },
  {
    label: 'Pengeluaran Iuran Listrik',
    key: 'outgoing_electricity_charge'
  },
  {
    label: 'Penerimaan Iuran Air',
    key: 'incoming_water_charge'
  },
  {
    label: 'Pengeluaran Iuran Air',
    key: 'outgoing_water_charge'
  },
  {
    label: 'Penerimaan Service Charge',
    key: 'incoming_service_charge'
  },
  {
    label: 'Pengeluaran Service Charge',
    key: 'outgoing_service_charge'
  },
  {
    label: 'Sinking Fund',
    key: 'sinking_fund'
  },
  {
    label: 'Pendapatan Lainnya',
    key: 'other_income'
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true
  }
]

interface FieldProps {
  id?: number
  date: string
  incoming_service_charge: number
  outgoing_service_charge: number
  incoming_water_charge: number
  outgoing_water_charge: number
  incoming_electricity_charge: number
  outgoing_electricity_charge: number
  sinking_fund: number
  other_income: number
  documents: {
    id: number | string
    url: string
  }[]
}

const PageFinancialReport = () => {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0
  })
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState<FieldProps>({
    id: 0,
    date: '',
    incoming_service_charge: 0,
    outgoing_service_charge: 0,
    incoming_water_charge: 0,
    outgoing_water_charge: 0,
    incoming_electricity_charge: 0,
    outgoing_electricity_charge: 0,
    sinking_fund: 0,
    other_income: 0,
    documents: []
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    variant: 'default',
    open: false,
    message: ''
  })
  const [search, setSearch] = useState('')
  const [isModalDeletePictureOpen, setIsModalDeletePictureOpen] =
    useState(false)
  const [isModalDeleteDocumentOpen, setIsModalDeleteDocumentOpen] =
    useState(false)
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
  const [selectedDocument, setSelectedDocument] = useState({
    id: 0,
    picture: ''
  })
  const uploadRef = useRef<any>(null)

  const debounceSearch = useDebounce(search, 500, () => setPage(1))

  const handleCloseToast = () => {
    setToast({
      variant: 'default',
      open: false,
      message: ''
    })
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
      date: '',
      incoming_service_charge: 0,
      outgoing_service_charge: 0,
      incoming_water_charge: 0,
      outgoing_water_charge: 0,
      incoming_electricity_charge: 0,
      outgoing_electricity_charge: 0,
      sinking_fund: 0,
      other_income: 0,
      documents: []
    })
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
      url: `/v1/financial-report/${fieldData.id}`,
      withAuth: true
    })
      .then(({ data: responseData }) => {
        setFields((prevState) => ({
          ...prevState,
          ...responseData.data
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
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setIsLoadingData(true)
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: false
    })
    api({
      url: `/v1/financial-report/${fieldData.id}`,
      withAuth: true
    })
      .then(({ data: responseData }) => {
        setFields((prevState) => ({
          ...prevState,
          ...responseData.data
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

  const handleModalDeleteDocumentOpen = (fieldData: any) => {
    setIsModalDeleteDocumentOpen(true)
    setSelectedDocument(fieldData)
  }

  const handleChangeField = (fieldName: string, value: string | number) => {
    setFields((prevState) => ({
      ...prevState,
      [fieldName]: value
    }))
  }

  const handleChangeNumericField = (fieldName: string, value: string) => {
    const numericValue = value.replace(/\D/g, '')
    setFields((prevState) => ({
      ...prevState,
      [fieldName]: +numericValue
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

  const handleGetNews = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/financial-report',
      withAuth: true,
      method: 'GET',
      params: {
        page,
        limit: PAGE_SIZE,
        search
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

  const apiSubmitCreate = () =>
    api({
      url: '/v1/financial-report/create',
      withAuth: true,
      method: 'POST',
      data: fields
    })

  const apiSubmitUpdate = () =>
    api({
      url: `/v1/financial-report/${fields.id}`,
      withAuth: true,
      method: 'PUT',
      data: fields
    })

  const apiSubmitDelete = () =>
    api({
      url: `/v1/financial-report/${fields.id}`,
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
        handleGetNews()
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

  const handleClickCancelDeleteDocument = () => {
    setIsModalDeleteDocumentOpen(false)
    setSelectedDocument({ id: 0, picture: '' })
  }

  const handleClickSubmitDeleteDocument = () => {
    handleClickCancelDeleteDocument()
    setIsLoadingSubmit(true)

    const newDocument = fields.documents.filter(
      (document: any) => document.id !== selectedDocument.id
    )
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        variant: 'default',
        open: true,
        message: 'Berhasil menghapus dokumen.'
      })
      setFields((prevState) => ({
        ...prevState,
        documents: newDocument
      }))
    }, 500)
  }

  const handleClickCancelDeletePicture = () => {
    setIsModalDeletePictureOpen(false)
  }

  const handleClickSubmitDeletePicture = () => {
    handleClickCancelDeletePicture()
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        variant: 'default',
        open: true,
        message: 'Berhasil menghapus foto.'
      })
      setFields((prevState) => ({
        ...prevState,
        picture: ''
      }))
    }, 500)
  }

  const handleClickDocumentUpload = () => {
    uploadRef.current.click()
  }

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const file = files[0]
      if (
        (file.type.includes('image') ||
          file.type.includes('pdf') ||
          file.type.includes('csv') ||
          file.type.includes('application/vnd.openxmlformats')) &&
        file.size < 500000
      ) {
        toBase64(file).then((result) => {
          uploadRef.current.value = null
          // console.log(result)
          setFields((prevState) => ({
            ...prevState,
            documents: [
              ...prevState.documents,
              {
                id: `temp-${prevState.documents.length}`,
                url: result as string
              }
            ]
          }))
        })
      } else {
        const message =
          file.size > 500000
            ? 'Ukuran file terlalu besar, silakan pilih file dibawah 500kb.'
            : 'Dokumen format tidak sesuai, silakan pilih format image, pdf, excel, atau csv.'
        setToast({
          variant: 'error',
          open: true,
          message
        })
      }
    }
  }

  const handleGetDocumentFile = (documentUrl: string) => {
    if (documentUrl.includes('pdf')) {
      return '/images/pdf.png'
    }
    if (
      documentUrl.includes('csv') ||
      documentUrl.includes('xls') ||
      documentUrl.includes('xlsx')
    ) {
      return '/images/xls.png'
    }
    return documentUrl
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    date: dayjs(column.date).format('DD MMMM YYYY'),
    incoming_electricity_charge: `Rp${column.incoming_electricity_charge.toLocaleString()}`,
    outgoing_electricity_charge: `Rp${column.outgoing_electricity_charge.toLocaleString()}`,
    incoming_water_charge: `Rp${column.incoming_water_charge.toLocaleString()}`,
    outgoing_water_charge: `Rp${column.outgoing_water_charge.toLocaleString()}`,
    incoming_service_charge: `Rp${column.incoming_service_charge.toLocaleString()}`,
    outgoing_service_charge: `Rp${column.outgoing_service_charge.toLocaleString()}`,
    sinking_fund: `Rp${column.sinking_fund.toLocaleString()}`,
    other_income: `Rp${column.other_income.toLocaleString()}`,
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
        {userPermissions.includes('news-edit') && (
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
        {userPermissions.includes('news-delete') && (
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

  console.log(fields)

  useEffect(() => {
    handleGetNews()
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
                placeholder="Cari judul"
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
            </div>
            <Button className="sm:ml-auto" onClick={handleModalCreateOpen}>
              Tambah
            </Button>
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

      <Modal open={modalForm.open} title={modalForm.title} size="lg">
        <form
          autoComplete="off"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6"
          onSubmit={() => handleClickConfirm(fields.id ? 'update' : 'create')}
        >
          <DatePicker
            label="Tanggal Report"
            placeholder="Tanggal Report"
            name="date"
            value={fields.date ? dayjs(fields.date).toDate() : undefined}
            onChange={(selectedDate) =>
              handleChangeField(
                'date',
                dayjs(selectedDate).format('YYYY-MM-DD')
              )
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <div />

          <Input
            placeholder="Penerimaan Iuran Listrik"
            label="Penerimaan Iuran Listrik"
            name="incoming_electricity_charge"
            value={(+fields.incoming_electricity_charge).toLocaleString()}
            leftIcon="Rp"
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Pengeluaran Iuran Listrik"
            label="Pengeluaran Iuran Listrik"
            name="outgoing_electricity_charge"
            value={(+fields.outgoing_electricity_charge).toLocaleString()}
            leftIcon="Rp"
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Penerimaan Iuran Air"
            label="Penerimaan Iuran Air"
            name="incoming_water_charge"
            value={(+fields.incoming_water_charge).toLocaleString()}
            leftIcon="Rp"
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Pengeluaran Iuran Air"
            label="Pengeluaran Iuran Air"
            name="outgoing_water_charge"
            value={(+fields.outgoing_water_charge).toLocaleString()}
            leftIcon="Rp"
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Penerimaan Service Charge"
            label="Penerimaan Service Charge"
            name="incoming_service_charge"
            value={(+fields.incoming_service_charge).toLocaleString()}
            leftIcon="Rp"
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Pengeluaran Service Charge"
            label="Pengeluaran Service Charge"
            name="outgoing_service_charge"
            value={(+fields.outgoing_service_charge).toLocaleString()}
            leftIcon="Rp"
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Sinking Fund"
            label="Sinking Fund"
            name="sinking_fund"
            value={(+fields.sinking_fund).toLocaleString()}
            leftIcon="Rp"
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Pendapatan Lainnya"
            label="Pendapatan Lainnya"
            name="other_income"
            value={(+fields.other_income).toLocaleString()}
            leftIcon="Rp"
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-600">
              Dokumen Tambahan
            </p>
            {!modalForm.readOnly && (
              <div>
                <Button
                  onClick={handleClickDocumentUpload}
                  size="sm"
                  variant="secondary"
                >
                  Upload Dokumen
                </Button>
                <input
                  ref={uploadRef}
                  type="file"
                  hidden
                  onChange={(e) => handleDocumentUpload(e.target.files)}
                />
              </div>
            )}
            <div className="flex gap-2">
              {fields.documents.length ? (
                fields.documents.map((document: any) => (
                  <div
                    key={document.id}
                    className="border border-slate-200 rounded hover:border-primary relative"
                  >
                    {!modalForm.readOnly && (
                      <span
                        className="rounded-full bg-red-500 absolute right-1 top-1 cursor-pointer p-2"
                        onClick={() => handleModalDeleteDocumentOpen(document)}
                        role="presentation"
                      >
                        <IconTrash
                          className="text-white"
                          width={16}
                          height={16}
                        />
                      </span>
                    )}
                    <img
                      src={handleGetDocumentFile(document.url)}
                      alt="doc"
                      className="w-[100px] h-[100px] object-contain"
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Belum ada dokumen</p>
              )}
            </div>
          </div>
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">
            Kembali
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

      <Modal open={isModalDeleteDocumentOpen} title="Hapus Dokumen" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">
            Apa anda yakin ingin menghapus dokumen?
          </p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeleteDocument} variant="default">
            Kembali
          </Button>
          <Button onClick={handleClickSubmitDeleteDocument}>Ya</Button>
        </div>
      </Modal>

      <Modal open={isModalDeletePictureOpen} title="Hapus Foto" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">
            Apa anda yakin ingin menghapus foto?
          </p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeletePicture} variant="default">
            Kembali
          </Button>
          <Button onClick={handleClickSubmitDeletePicture}>Ya</Button>
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

export default PageFinancialReport
