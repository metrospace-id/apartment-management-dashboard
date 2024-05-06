import {
  useState, useEffect, useRef, useCallback,
} from 'react'
import Webcam from 'react-webcam'

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
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import { RELATION } from 'constants/tenant'
import { exportToExcel } from 'utils/export'
import TextArea from 'components/Form/TextArea'
import { toBase64 } from 'utils/file'
import dayjs from 'dayjs'
import Select from 'components/Form/Select'
import DatePicker from 'components/Form/DatePicker'
import api from 'utils/api'
import Badge from 'components/Badge'

const PAGE_NAME = 'Penghuni Unit Apartemen'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No Unit',
    key: 'unit_code',
  },
  {
    label: 'Nama Penghuni',
    key: 'name',
  },
  {
    label: 'No. Telepon',
    key: 'phone',
  },
  {
    label: 'Nama Pemilik',
    key: 'owner_name',
  },
  {
    label: 'Hub. Dengan Pemilik',
    key: 'relation',
  },
  {
    label: 'Tanggal Masuk',
    key: 'start_date',
  },
  {
    label: 'Tanggal Keluar',
    key: 'end_date',
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true,
  },
]

interface FieldProps {
  id?: number
  unit_id: number
  name: string
  address: string
  phone: string
  email: string
  identity_no: string
  kk_no: string
  start_date: string
  end_date: string
  picture: string
  relation: string
  documents: {
    id: number | string
    url: string
  }[]
}

function PageTenantUnit() {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  })
  const [dataUnits, setDataUnits] = useState<{ id: number, unit_code: string }[]>([])
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState<FieldProps>({
    id: 0,
    unit_id: 0,
    name: '',
    address: '',
    phone: '',
    email: '',
    identity_no: '',
    kk_no: '',
    picture: '',
    relation: '',
    start_date: '',
    end_date: '',
    documents: [],
  })
  const [filter, setFilter] = useState({
    relation: '',
    start_date: '',
    end_date: '',
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: '',
  })
  const [search, setSearch] = useState('')
  const [isModalFilterOpen, setIsModalFilterOpen] = useState(false)
  const [isModalDeleteDocumentOpen, setIsModalDeleteDocumentOpen] = useState(false)
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
  const [selectedDocument, setSelectedDocument] = useState({ id: 0, picture: '' })
  const cameraRef = useRef<any>(null)
  const uploadRef = useRef<any>(null)

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
      unit_id: 0,
      name: '',
      address: '',
      phone: '',
      email: '',
      identity_no: '',
      kk_no: '',
      picture: '',
      documents: [],
      relation: '',
      start_date: '',
      end_date: '',
    })
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

  const handleModalFilterOpen = () => {
    setIsModalFilterOpen(true)
  }

  const handleModalFilterClose = () => {
    setIsModalFilterOpen(false)
  }

  const handleModalDetailOpen = (fieldData: any) => {
    setIsLoadingData(true)
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true,
    })
    api({
      url: `/v1/tenant/${fieldData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      setFields((prevState) => ({
        ...prevState,
        ...responseData.data,
      }))
      setIsLoadingData(false)
    })
      .catch((error) => {
        setToast({
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
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    api({
      url: `/v1/tenant/${fieldData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      setFields((prevState) => ({
        ...prevState,
        ...responseData.data,
      }))
      setIsLoadingData(false)
    })
      .catch((error) => {
        setToast({
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

  const handleModalDeleteDocumentOpen = (fieldData: any) => {
    setIsModalDeleteDocumentOpen(true)
    setSelectedDocument(fieldData)
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

  const handleGetTenants = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/tenant/unit',
      withAuth: true,
      method: 'GET',
      params: {
        page,
        limit: PAGE_SIZE,
        search,
        relation: filter.relation,
        start_date: filter.start_date,
        end_date: filter.end_date,
      },
    })
      .then(({ data: responseData }) => {
        setData(responseData.data)
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleGetAllUnits = () => {
    api({
      url: '/v1/unit',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
      },
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataUnits(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      })
  }

  const apiSubmitCreate = () => api({
    url: '/v1/tenant/create',
    withAuth: true,
    method: 'POST',
    data: fields,
  })

  const apiSubmitUpdate = () => api({
    url: `/v1/tenant/${fields.id}`,
    withAuth: true,
    method: 'PUT',
    data: fields,
  })

  const apiSubmitDelete = () => api({
    url: `/v1/tenant/${fields.id}`,
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
    }

    apiSubmit().then(() => {
      handleGetTenants()
      handleModalFormClose()
      setToast({
        open: true,
        message: MODAL_CONFIRM_TYPE[submitType].message,
      })
    })
      .catch((error) => {
        handleModalConfirmClose()
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  const handleSubmitFilter = () => {
    handleModalFilterClose()
    handleGetTenants()
  }

  const handleClickCancelDeleteDocument = () => {
    setIsModalDeleteDocumentOpen(false)
    setSelectedDocument({ id: 0, picture: '' })
  }

  const handleClickSubmitDeleteDocument = () => {
    handleClickCancelDeleteDocument()
    setIsLoadingSubmit(true)

    const newDocument = fields.documents.filter((document: any) => document.id !== selectedDocument.id)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        open: true,
        message: 'Berhasil menghapus dokumen.',
      })
      setFields((prevState) => ({
        ...prevState,
        documents: newDocument,
      }))
    }, 500)
  }

  const handleGetPicture = useCallback(() => {
    const imageSrc = cameraRef.current.getScreenshot()
    setIsWebcamOpen(false)

    setFields((prevState) => ({
      ...prevState,
      picture: imageSrc,
    }))
  }, [cameraRef])

  const handleClickDocumentUpload = () => {
    uploadRef.current.click()
  }

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const file = files[0]
      // console.log(file)
      if ((file.type.includes('image') || file.type.includes('pdf')) && file.size < 500000) {
        toBase64(file).then((result) => {
          uploadRef.current.value = null
          // console.log(result)
          setFields((prevState) => ({
            ...prevState,
            documents: [...prevState.documents, {
              id: `temp-${prevState.documents.length}`,
              url: result as string,
            }],
          }))
        })
      } else {
        const message = file.size > 500000 ? 'Ukuran file terlalu besar, silakan pilih file dibawah 500kb.' : 'Dokumen format tidak sesuai, silakan pilih format image atau pdf.'
        setToast({
          open: true,
          message,
        })
      }
    }
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    unit_code: column.unit_code,
    name: column.id ? column.name : column.owner_name,
    phone: column.id ? column.phone : column.owner_phone,
    owner_name: column.id ? column.owner_name : '-',
    relation: column.id ? <Badge variant="default">{column.relation}</Badge> : <Badge variant="primary">Pemilik</Badge>,
    start_date: column.start_date ? dayjs(column.start_date).format('YYYY-MM-DD') : '-',
    end_date: column.end_date ? dayjs(column.end_date).format('YYYY-MM-DD') : '-',
    action: (
      <div className="flex items-center gap-1">
        {column.id && (
        <Popover content="Detail">
          <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        )}
        {userPermissions.includes('tenant-unit-edit') && column.id && (
        <Popover content="Ubah">
          <Button variant="primary" size="sm" icon onClick={() => handleModalUpdateOpen(column)}>
            <IconEdit className="w-4 h-4" />
          </Button>
        </Popover>
        )}
        {userPermissions.includes('tenant-unit-delete') && column.id && (
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
    handleGetTenants()
  }, [debounceSearch, page])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser.permissions) {
        setUserPermissions(localStorageUser.permissions)
      }
    }, 500)

    handleGetAllUnits()
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input placeholder="Cari nama, no. unit" onChange={(e) => setSearch(e.target.value)} fullWidth />
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
          <Autocomplete
            placeholder="Nomor Unit"
            label="Nomor Unit"
            name="unit_id"
            items={dataUnits.map((itemData) => ({
              label: itemData.unit_code,
              value: itemData.id,
            }))}
            value={{
              label: dataUnits.find((itemData) => itemData.id === fields.unit_id)?.unit_code || '',
              value: dataUnits.find((itemData) => itemData.id === fields.unit_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('unit_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nama Penghuni"
            label="Nama Penghuni"
            name="name"
            value={fields.name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Masuk"
            placeholder="Tanggal Masuk"
            name="start_date"
            value={fields.start_date ? dayjs(fields.start_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('start_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Keluar"
            placeholder="Tanggal Keluar"
            name="end_date"
            value={fields.end_date ? dayjs(fields.end_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('end_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Select
            placeholder="Hubungan Dengan Pemilik"
            label="Hubungan Dengan Pemilik"
            name="relation"
            value={fields.relation}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Hubungan',
              value: '',
              disabled: true,
            },
            ...RELATION.map((item) => ({
              label: item,
              value: item,
            }))]}
          />

          <TextArea
            placeholder="Alamat"
            label="Alamat"
            name="address"
            value={fields.address}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nomor HP"
            label="Nomor HP"
            name="phone"
            type="tel"
            value={fields.phone}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Email"
            label="Email"
            name="email"
            type="email"
            value={fields.email}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Identitas"
            label="No. Identitas"
            name="identity_no"
            type="tel"
            value={fields.identity_no}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Kartu Keluarga"
            label="No. Kartu Keluarga"
            name="kk_no"
            type="tel"
            value={fields.kk_no}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-600">
              Foto Penghuni
            </p>

            <div>
              {isWebcamOpen && (
              <Webcam
                ref={cameraRef}
                videoConstraints={{
                  width: 300,
                  height: 300,
                  facingMode: 'user',
                }}
                audio={false}
                width={300}
                height={300}
                screenshotFormat="image/jpeg"
                className="mb-2"
              />
              )}

              {!isWebcamOpen && fields.picture && <img src={fields.picture} alt="profile" className="mb-2" width={300} />}

              {!modalForm.readOnly && (
                <div className="flex gap-1">
                  {!isWebcamOpen && (
                  <Button onClick={() => setIsWebcamOpen((prevState) => !prevState)} size="sm" variant="secondary">
                    {fields.picture ? 'Ambil Ulang Gambar' : 'Buka Kamera'}
                  </Button>
                  )}
                  {isWebcamOpen && (
                  <>
                    <Button onClick={() => setIsWebcamOpen((prevState) => !prevState)} size="sm" variant="secondary">Tutup Kamera</Button>
                    <Button onClick={handleGetPicture} size="sm">Ambil Gambar</Button>
                  </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-600">
              Dokumen Pendukung
            </p>
            {!modalForm.readOnly && (
              <div>
                <Button onClick={handleClickDocumentUpload} size="sm" variant="secondary">
                  Upload Dokumen
                </Button>
                <input ref={uploadRef} type="file" hidden onChange={(e) => handleDocumentUpload(e.target.files)} />
              </div>
            )}
            <div className="flex gap-2">
              {fields.documents.length ? fields.documents.map((document: any) => (
                <div key={document.id} className="border border-slate-200 rounded hover:border-primary relative">
                  {!modalForm.readOnly && (
                  <span
                    className="rounded-full bg-red-500 absolute right-1 top-1 cursor-pointer p-2"
                    onClick={() => handleModalDeleteDocumentOpen(document)}
                    role="presentation"
                  >
                    <IconTrash className="text-white" width={16} height={16} />
                  </span>
                  )}
                  <img src={document.url.includes('pdf') ? '/images/pdf.png' : document.url} alt="doc" className="w-[100px] h-[100px] object-contain" />
                </div>
              )) : (
                <p className="text-sm text-slate-600">Belum ada dokumen</p>
              )}
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

          <DatePicker
            label="Tanggal Masuk"
            placeholder="Tanggal Masuk"
            name="start_date"
            value={filter.start_date ? dayjs(filter.start_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeFilterField('start_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Keluar"
            placeholder="Tanggal Keluar"
            name="end_date"
            value={filter.end_date ? dayjs(filter.end_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeFilterField('end_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Select
            placeholder="Hubungan Dengan Pemilik"
            label="Hubungan Dengan Pemilik"
            name="relation"
            value={filter.relation}
            onChange={(e) => handleChangeFilterField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Hubungan',
              value: '',
              disabled: true,
            },
            ...RELATION.map((item) => ({
              label: item,
              value: item,
            }))]}
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

      <Modal open={isModalDeleteDocumentOpen} title="Hapus Dokumen" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">Apa anda yakin ingin menghapus dokumen?</p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeleteDocument} variant="default">Kembali</Button>
          <Button onClick={handleClickSubmitDeleteDocument}>Ya</Button>
        </div>
      </Modal>

      {isLoadingSubmit && (
        <LoadingOverlay />
      )}

      <Toast open={toast.open} message={toast.message} onClose={handleCloseToast} />

    </Layout>
  )
}

export default PageTenantUnit
