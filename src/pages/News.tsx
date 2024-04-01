import {
  useState, useMemo, useEffect, useRef,
} from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Table from 'components/Table/Table'
import Button from 'components/Button'
import Modal from 'components/Modal'
import Input from 'components/Form/Input'
import Popover from 'components/Popover'
import Select from 'components/Form/Select'
import { Edit as IconEdit, TrashAlt as IconTrash, FileText as IconFile } from 'components/Icons'
import type { TableHeaderProps } from 'components/Table/Table'
import useDebounce from 'hooks/useDebounce'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Toast from 'components/Toast'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import { toBase64 } from 'utils/file'

const PAGE_NAME = 'Berita'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Nama Berita',
    key: 'name',
  },
  {
    label: 'Jenis',
    key: 'type',
  },
  {
    label: 'Status',
    key: 'status',
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
  name: `Berita ${key + 1}`,
  type: key % 2,
  text: '<p>Berita</p>',
  picture: 'https://via.placeholder.com/300x300',
  documents: [{
    id: 1,
    picture: 'https://via.placeholder.com/300x300',
  }],
  status: 1,
}))

function PageNews() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
    id: 0,
    name: '',
    type: '',
    text: '',
    status: '',
    picture: '',
    documents: [{}],
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: '',
  })
  const [search, setSearch] = useState('')
  const [isModalDeletePictureOpen, setIsModalDeletePictureOpen] = useState(false)
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
  const pictureRef = useRef<any>(null)
  const uploadRef = useRef<any>(null)

  const debounceSearch = useDebounce(search, 500)

  const paginateTableData = useMemo(
    () => data.slice(page * PAGE_SIZE, (page * PAGE_SIZE) + PAGE_SIZE),
    [page, data],
  )

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
      name: '',
      type: '',
      text: '',
      status: '',
      picture: '',
      documents: [{}],
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
    setFields({
      id: fieldData.id,
      name: fieldData.name,
      type: fieldData.type,
      text: fieldData.text,
      status: fieldData.status,
      picture: fieldData.picture,
      documents: fieldData.documents,
    })
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setModalForm({
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    setFields({
      id: fieldData.id,
      name: fieldData.name,
      type: fieldData.type,
      text: fieldData.text,
      status: fieldData.status,
      picture: fieldData.picture,
      documents: fieldData.documents,
    })
  }

  const handleModalDeleteOpen = (fieldData: any) => {
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE.delete.title,
      description: MODAL_CONFIRM_TYPE.delete.description,
      open: true,
    })
    setSubmitType('delete')
    setFields({
      id: fieldData.id,
      name: fieldData.name,
      type: fieldData.type,
      text: fieldData.text,
      status: fieldData.status,
      picture: fieldData.picture,
      documents: fieldData.documents,
    })
  }

  const handleModalDeleteDocumentOpen = (fieldData: any) => {
    setIsModalDeleteDocumentOpen(true)
    setSelectedDocument(fieldData)
  }

  const handleModalDeletePictureOpen = () => {
    setIsModalDeletePictureOpen(true)
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

  const handleClickCancelDeletePicture = () => {
    setIsModalDeletePictureOpen(false)
  }

  const handleClickSubmitDeletePicture = () => {
    handleClickCancelDeletePicture()
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        open: true,
        message: 'Berhasil menghapus foto.',
      })
      setFields((prevState) => ({
        ...prevState,
        picture: '',
      }))
    }, 500)
  }

  const handleClickPictureUpload = () => {
    pictureRef.current.click()
  }

  const handlePictureUpload = (files: FileList | null) => {
    if (files) {
      const file = files[0]
      // console.log(file)
      if ((file.type.includes('image') || file.type.includes('pdf')) && file.size < 500000) {
        toBase64(file).then((result) => {
          pictureRef.current.value = null
          setFields((prevState) => ({
            ...prevState,
            picture: result as string,
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
    name: column.name,
    type: column.type,
    status: column.status,
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
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input placeholder="Cari nama" onChange={(e) => setSearch(e.target.value)} fullWidth />
            </div>
            <Button className="sm:ml-auto" onClick={handleModalCreateOpen}>Tambah</Button>
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

      <Modal open={modalForm.open} title={modalForm.title} size="lg">
        <form autoComplete="off" className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6" onSubmit={() => handleClickConfirm(fields.id ? 'update' : 'create')}>
          <Input
            placeholder="Judul Berita"
            label="Judul Berita"
            name="name"
            value={fields.name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Select
            placeholder="Jenis Berita"
            label="Jenis Berita"
            name="type"
            value={fields.type}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Jenis Berita',
              value: '',
              disabled: true,
            },
            {
              label: 'Berita',
              value: 1,
            },
            {
              label: 'Informasi',
              value: 2,
            }]}
          />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-600">
              Foto Berita
            </p>

            {!modalForm.readOnly && !fields.picture && (
            <div>
              <Button onClick={handleClickPictureUpload} size="sm" variant="secondary">
                Upload Foto
              </Button>

              <input ref={pictureRef} type="file" hidden onChange={(e) => handlePictureUpload(e.target.files)} />
            </div>
            )}
            <div className="flex gap-2">
              {fields.picture ? (
                <div className="border border-slate-200 rounded hover:border-primary relative">
                  {!modalForm.readOnly && (
                  <span
                    className="rounded-full bg-red-500 absolute right-0 top-0 cursor-pointer p-2"
                    onClick={handleModalDeletePictureOpen}
                    role="presentation"
                  >
                    <IconTrash className="text-white" width={16} height={16} />
                  </span>
                  )}
                  <img src={fields.picture} alt="doc" className="w-[300px] h-[300px] object-contain" />
                </div>
              ) : (
                <p className="text-sm text-slate-600">Belum ada foto</p>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-slate-600 dark:text-white mb-2">Deskripsi</p>
            <ReactQuill theme="snow" value={fields.text} onChange={(value) => handleChangeField('text', value)} />
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
          <Button onClick={handleModalFormClose} variant="default">Kembali</Button>
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

      <Modal open={isModalDeletePictureOpen} title="Hapus Foto" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">Apa anda yakin ingin menghapus foto?</p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeletePicture} variant="default">Kembali</Button>
          <Button onClick={handleClickSubmitDeletePicture}>Ya</Button>
        </div>
      </Modal>

      {isLoadingSubmit && (
        <LoadingOverlay />
      )}

      <Toast open={toast.open} message={toast.message} onClose={handleCloseToast} />

    </Layout>
  )
}

export default PageNews
