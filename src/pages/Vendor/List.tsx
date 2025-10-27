import { useEffect, useRef, useState } from 'react'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Autocomplete from 'components/Form/Autocomplete'
import Input from 'components/Form/Input'
import TextArea from 'components/Form/TextArea'
import {
  Edit as IconEdit,
  FileText as IconFile,
  TrashAlt as IconTrash
} from 'components/Icons'
import Layout from 'components/Layout'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import Popover from 'components/Popover'
import type { TableHeaderProps } from 'components/Table/Table'
import Table from 'components/Table/Table'
import Toast from 'components/Toast'
import { MODAL_CONFIRM_TYPE, PAGE_SIZE } from 'constants/form'
import { VENDOR_SECTORS } from 'constants/vendor'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'
import { exportToExcel } from 'utils/export'
import { toBase64 } from 'utils/file'

const PAGE_NAME = 'Vendor List'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Nama Perusahaan',
    key: 'name'
  },
  {
    label: 'Nara Hubung',
    key: 'contact_person'
  },
  {
    label: 'No. Telepon',
    key: 'phone'
  },
  {
    label: 'Email',
    key: 'email'
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
  name: string
  contact_person: string
  address: string
  phone: string
  fax: string
  email: string
  sector: string
  notes: string
  picture: string
  documents: {
    id: number | string
    url: string
  }[]
}

const PageVendorList = () => {
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
    name: '',
    contact_person: '',
    address: '',
    phone: '',
    fax: '',
    email: '',
    sector: '',
    notes: '',
    picture: '',
    documents: []
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
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
  const pictureRef = useRef<any>(null)
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
      name: '',
      contact_person: '',
      address: '',
      phone: '',
      fax: '',
      email: '',
      sector: '',
      notes: '',
      picture: '',
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
      url: `/v1/vendor/${fieldData.id}`,
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
      url: `/v1/vendor/${fieldData.id}`,
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

  const handleModalDeletePictureOpen = () => {
    setIsModalDeletePictureOpen(true)
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

  const handleGetVendors = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/vendor',
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
      url: '/v1/vendor/create',
      withAuth: true,
      method: 'POST',
      data: fields
    })

  const apiSubmitUpdate = () =>
    api({
      url: `/v1/vendor/${fields.id}`,
      withAuth: true,
      method: 'PUT',
      data: fields
    })

  const apiSubmitDelete = () =>
    api({
      url: `/v1/vendor/${fields.id}`,
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
        handleGetVendors()
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
        open: true,
        message: 'Berhasil menghapus foto.'
      })
      setFields((prevState) => ({
        ...prevState,
        picture: ''
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
      if (
        (file.type.includes('image') || file.type.includes('pdf')) &&
        file.size < 500000
      ) {
        toBase64(file).then((result) => {
          pictureRef.current.value = null
          setFields((prevState) => ({
            ...prevState,
            picture: result as string
          }))
        })
      } else {
        const message =
          file.size > 500000
            ? 'Ukuran file terlalu besar, silakan pilih file dibawah 500kb.'
            : 'Dokumen format tidak sesuai, silakan pilih format image atau pdf.'
        setToast({
          open: true,
          message
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
      if (
        (file.type.includes('image') || file.type.includes('pdf')) &&
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
            : 'Dokumen format tidak sesuai, silakan pilih format image atau pdf.'
        setToast({
          open: true,
          message
        })
      }
    }
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    name: column.name,
    contact_person: column.contact_person,
    phone: column.phone,
    email: column.email,
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
        {userPermissions.includes('vendor-list-edit') && (
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
        {userPermissions.includes('vendor-list-delete') && (
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
    handleGetVendors()
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
          <Input
            placeholder="Nama Perusahaan"
            label="Nama Perusahaan"
            name="name"
            value={fields.name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Bidang"
            label="Bidang"
            name="sector"
            items={VENDOR_SECTORS.map((itemData) => ({
              label: itemData,
              value: itemData
            }))}
            value={{
              label:
                VENDOR_SECTORS.find((itemData) => itemData === fields.sector) ||
                '',
              value:
                VENDOR_SECTORS.find((itemData) => itemData === fields.sector) ||
                ''
            }}
            onChange={(value) => handleChangeField('sector', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nama Narahubung"
            label="Nama Narahubung"
            name="contact_person"
            value={fields.contact_person}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <div className="sm:col-span-2">
            <TextArea
              placeholder="Alamat"
              label="Alamat"
              name="address"
              value={fields.address}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />
          </div>

          <Input
            placeholder="No. Telepon"
            label="No. Telepon"
            name="phone"
            type="tel"
            value={fields.phone}
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Fax"
            label="Fax"
            name="fax"
            type="tel"
            value={fields.fax}
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
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

          <div className="sm:col-span-2">
            <TextArea
              placeholder="Keterangan"
              label="Keterangan"
              name="notes"
              value={fields.notes}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-600">
              Foto Perusahaan
            </p>

            {!modalForm.readOnly && !fields.picture && (
              <div>
                <Button
                  onClick={handleClickPictureUpload}
                  size="sm"
                  variant="secondary"
                >
                  Upload Foto
                </Button>

                <input
                  ref={pictureRef}
                  type="file"
                  hidden
                  onChange={(e) => handlePictureUpload(e.target.files)}
                />
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
                      <IconTrash
                        className="text-white"
                        width={16}
                        height={16}
                      />
                    </span>
                  )}
                  <img
                    src={fields.picture}
                    alt="doc"
                    className="w-[300px] h-[300px] object-contain"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-600">Belum ada foto</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-600">
              Dokumen Pendukung
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
                      src={
                        document.url.includes('pdf')
                          ? '/images/pdf.png'
                          : document.url
                      }
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
        onClose={handleCloseToast}
      />
    </Layout>
  )
}

export default PageVendorList
