import {
  useState, useMemo, useEffect, useRef, useCallback,
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
import { exportToExcel } from 'utils/export'
import TextArea from 'components/Form/TextArea'
import { toBase64 } from 'utils/file'
import dayjs from 'dayjs'
import Select from 'components/Form/Select'
import DatePicker from 'components/Form/DatePicker'

const PAGE_NAME = 'Penghuni'

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

const TABLE_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  unit_id: key + 1,
  unit_code: `A/01/${key + 1}`,
  name: `Nama Penghuni ${key + 1}`,
  phone: `08123${key + 1}`,
  owner_name: `Nama Pemilik ${key + 1}`,
  relation: 'Keluarga',
  address: 'Alamat Lorem Ipsum',
  identity_no: `12345${key + 1}`,
  start_date: '2023-12-31 00:00:00',
  end_date: '2024-12-31 00:00:00',
  kk_no: `12345${key + 1}`,
  picture: 'https://via.placeholder.com/300x300',
  document: [{
    id: 1,
    picture: 'https://via.placeholder.com/300x300',
  }],
}))

const UNIT_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  unit_code: `A/${key + 1}/${key + 1}`,
  tower: 'A',
  unit_no: `${key + 1}`,
  floor_no: `${key + 1}`,
}))

function PageTenant() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
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
    documents: [{}],
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: '',
  })
  const [search, setSearch] = useState('')
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
      unit_id: 0,
      name: '',
      address: '',
      phone: '',
      email: '',
      identity_no: '',
      kk_no: '',
      picture: '',
      documents: [''],
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

  const handleModalDetailOpen = (fieldData: any) => {
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true,
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      unit_id: fieldData.unit_id,
      name: fieldData.name,
      address: fieldData.address,
      phone: fieldData.phone,
      email: fieldData.email,
      identity_no: fieldData.identity_no,
      kk_no: fieldData.kk_no,
      picture: fieldData.picture,
      documents: fieldData.document,
      relation: fieldData.relation,
      start_date: fieldData.start_date,
      end_date: fieldData.end_date,
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
      unit_id: fieldData.unit_id,
      name: fieldData.name,
      address: fieldData.address,
      phone: fieldData.phone,
      email: fieldData.email,
      identity_no: fieldData.identity_no,
      kk_no: fieldData.kk_no,
      picture: fieldData.picture,
      documents: fieldData.document,
      relation: fieldData.relation,
      start_date: fieldData.start_date,
      end_date: fieldData.end_date,
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
      unit_id: fieldData.unit_id,
      name: fieldData.name,
      address: fieldData.address,
      phone: fieldData.phone,
      email: fieldData.email,
      identity_no: fieldData.identity_no,
      kk_no: fieldData.kk_no,
      picture: fieldData.picture,
      documents: fieldData.document,
      relation: fieldData.relation,
      start_date: fieldData.start_date,
      end_date: fieldData.end_date,
    }))
  }

  const handleModalDeleteDocumentOpen = (fieldData: any) => {
    setIsModalDeleteDocumentOpen(true)
    setSelectedDocument(fieldData)
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
              id: prevState.documents.length,
              picture: result,
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

  const tableDatas = TABLE_DATA.map((column) => ({
    id: column.id,
    unit_code: column.unit_code,
    name: column.name,
    phone: column.phone,
    owner_name: column.owner_name,
    relation: column.relation,
    start_date: dayjs(column.start_date).format('YYYY-MM-DD'),
    end_date: dayjs(column.end_date).format('YYYY-MM-DD'),
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
          (tableData) => tableData.name.toLowerCase().includes(debounceSearch.toLowerCase()),
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
        <div className="p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[250px]">
              <Input placeholder="Cari nama" onChange={(e) => setSearch(e.target.value)} fullWidth />
            </div>
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
          <Autocomplete
            placeholder="Nomor Unit"
            label="Nomor Unit"
            name="unit_id"
            items={UNIT_DATA.map((itemData) => ({
              label: itemData.unit_code,
              value: itemData.id,
            }))}
            value={{
              label: UNIT_DATA.find((itemData) => itemData.id === fields.unit_id)?.unit_code || '',
              value: UNIT_DATA.find((itemData) => itemData.id === fields.unit_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('group_id', value.value)}
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
            label="Tanggal Mulai"
            placeholder="Tanggal Mulai"
            name="start_date"
            value={fields.start_date ? dayjs(fields.start_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('start', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Selesai"
            placeholder="Tanggal Selesai"
            name="end_date"
            value={fields.end_date ? dayjs(fields.end_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('start', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Select
            placeholder="Hubungan Dengan Pemilik"
            label="Hubungan Dengan Pemilik"
            name="relation"
            value={fields.relation}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Hubungan',
              value: '',
              disabled: true,
            },
            {
              label: 'Penghuni',
              value: 'Penghuni',
            },
            {
              label: 'Keluarga',
              value: 'Keluarga',
            }]}
          />

          <TextArea
            placeholder="Alamat"
            label="Alamat"
            name="alamat"
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
            value={fields.phone}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
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
              {fields.documents.length ? fields.documents.map((document: any) => {
                if (document.id) {
                  return (
                    <div key={document.id} className="border border-slate-200 rounded hover:border-sky-700 relative [&_span]:hover:block">
                      {!modalForm.readOnly && (
                        <span
                          className="rounded-full bg-red-500 absolute right-0 top-0 cursor-pointer hidden p-2"
                          onClick={() => handleModalDeleteDocumentOpen(document)}
                          role="presentation"
                        >
                          <IconTrash className="text-white" />
                        </span>
                      )}
                      <img src={document.picture.includes('pdf') ? '/images/pdf.png' : document.picture} alt="doc" className="w-[100px] h-[100px] object-contain" />
                    </div>
                  )
                }
                return null
              }) : (
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

export default PageTenant
