import { s } from '@fullcalendar/core/internal-common'
import { useState, useEffect, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Autocomplete from 'components/Form/Autocomplete'
import Input from 'components/Form/Input'
import TextArea from 'components/Form/TextArea'
import {
  Edit as IconEdit,
  TrashAlt as IconTrash,
  FileText as IconFile,
  UserPlus as IconUser
} from 'components/Icons'
import Layout from 'components/Layout'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import Popover from 'components/Popover'
import Table from 'components/Table/Table'
import type { TableHeaderProps } from 'components/Table/Table'
import Toast from 'components/Toast'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'
import { exportToExcel } from 'utils/export'
import { toBase64 } from 'utils/file'

const PAGE_NAME = 'Pemilik'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No Unit',
    key: 'unit_code'
  },
  {
    label: 'Nama Pemilik',
    key: 'name'
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
  unit_id: number
  name: string
  address: string
  phone: string
  email: string
  identity_no: string
  kk_no: string
  picture: string
  documents: {
    id: number | string
    url: string
  }[]
}

const PageOwner = () => {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0
  })
  const [dataUnits, setDataUnits] = useState<
    { id: number; unit_code: string }[]
  >([])
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
    documents: []
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: ''
  })
  const [search, setSearch] = useState('')
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
  const cameraRef = useRef<any>(null)
  const uploadRef = useRef<any>(null)
  const [isModalCreateAccountOpen, setIsModalCreateAccountOpen] =
    useState(false)
  const [isOwnerHasAccount, setIsOwnerHasAccount] = useState(false)

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
      unit_id: 0,
      name: '',
      address: '',
      phone: '',
      email: '',
      identity_no: '',
      kk_no: '',
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

  const handleCheckUsersByOwnerId = (owner_id?: number) => {
    api({
      url: '/v1/user',
      withAuth: true,
      params: {
        page,
        limit: PAGE_SIZE,
        owner_id,
        type: 2
      }
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setIsOwnerHasAccount(true)
        }
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

  const handleModalDetailOpen = (fieldData: any) => {
    setIsLoadingData(true)
    setIsOwnerHasAccount(false)
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true
    })

    handleCheckUsersByOwnerId(fieldData.id)

    api({
      url: `/v1/owner/${fieldData.id}`,
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
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false
    })

    api({
      url: `/v1/owner/${fieldData.id}`,
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

  const handleGetOwners = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/owner',
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

  const handleGetAllUnits = () => {
    api({
      url: '/v1/unit',
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

  const apiSubmitCreate = () =>
    api({
      url: '/v1/owner/create',
      withAuth: true,
      method: 'POST',
      data: fields
    })

  const apiSubmitUpdate = () =>
    api({
      url: `/v1/owner/${fields.id}`,
      withAuth: true,
      method: 'PUT',
      data: {
        ...fields,
        email: isOwnerHasAccount ? undefined : fields.email
      }
    })

  const apiSubmitDelete = () =>
    api({
      url: `/v1/owner/${fields.id}`,
      withAuth: true,
      method: 'DELETE'
    })

  const apiSubmitCreateAccount = () =>
    api({
      url: '/v1/user/create',
      withAuth: true,
      method: 'POST',
      data: {
        name: fields.name,
        email: fields.email,
        type: 2,
        owner_id: fields.id,
        role_ids: [process.env.REACT_APP_RESIDENT_ROLE_ID]
      }
    })

  const handleClickSubmitCreateAccount = () => {
    setIsLoadingSubmit(true)
    apiSubmitCreateAccount()
      .then(() => {
        setToast({
          open: true,
          message:
            'Berhasil menambahkan akun. Username dan password akan dikirimkan ke email user.'
        })

        handleCheckUsersByOwnerId(fields.id)
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsModalCreateAccountOpen(false)
        setIsLoadingSubmit(false)
      })
  }

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
        handleGetOwners()
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

  const handleGetPicture = useCallback(() => {
    const imageSrc = cameraRef.current.getScreenshot()
    setIsWebcamOpen(false)

    setFields((prevState) => ({
      ...prevState,
      picture: imageSrc
    }))
  }, [cameraRef])

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
    unit_code: column.unit_code,
    name: column.name,
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
        {userPermissions.includes('owner-edit') && (
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
        {/* {userPermissions.includes('owner-create') && (
        <Popover content="+ Akun">
          <Button variant="warning" size="sm" icon onClick={() => handleModalUpdateOpen(column)}>
            <IconUser className="w-4 h-4" />
          </Button>
        </Popover>
        )} */}
        {userPermissions.includes('owner-edit') && (
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
    handleGetOwners()
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
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input
                placeholder="Cari nama, no. unit"
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
          <Autocomplete
            placeholder="Nomor Unit"
            label="Nomor Unit"
            name="unit_id"
            items={dataUnits.map((itemData) => ({
              label: itemData.unit_code,
              value: itemData.id
            }))}
            value={{
              label:
                dataUnits.find((itemData) => itemData.id === fields.unit_id)
                  ?.unit_code || '',
              value:
                dataUnits.find((itemData) => itemData.id === fields.unit_id)
                  ?.id || ''
            }}
            onChange={(value) => handleChangeField('unit_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nama Pemilik"
            label="Nama Pemilik"
            name="name"
            value={fields.name}
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
            placeholder="Nomor HP"
            label="Nomor HP"
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
            placeholder="Email"
            label="Email"
            name="email"
            type="email"
            value={fields.email}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            disabled={isOwnerHasAccount}
            helperText={
              isOwnerHasAccount
                ? 'Silakan hubungi admin untuk mengubah email pemilik.'
                : ''
            }
            fullWidth
          />

          <Input
            placeholder="No. Identitas"
            label="No. Identitas"
            name="identity_no"
            type="tel"
            value={fields.identity_no}
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Kartu Keluarga"
            label="No. Kartu Keluarga"
            name="kk_no"
            type="tel"
            value={fields.kk_no}
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-600">Foto Pemilik</p>

            <div>
              {isWebcamOpen && (
                <Webcam
                  ref={cameraRef}
                  videoConstraints={{
                    width: 300,
                    height: 300,
                    facingMode: 'user'
                  }}
                  audio={false}
                  width={300}
                  height={300}
                  screenshotFormat="image/jpeg"
                  className="mb-2"
                />
              )}

              {!isWebcamOpen && fields.picture && (
                <img
                  src={fields.picture}
                  alt="profile"
                  className="mb-2"
                  width={300}
                />
              )}

              {!modalForm.readOnly && (
                <div className="flex gap-1">
                  {!isWebcamOpen && (
                    <Button
                      onClick={() => setIsWebcamOpen((prevState) => !prevState)}
                      size="sm"
                      variant="secondary"
                    >
                      {fields.picture ? 'Ambil Ulang Gambar' : 'Buka Kamera'}
                    </Button>
                  )}
                  {isWebcamOpen && (
                    <>
                      <Button
                        onClick={() =>
                          setIsWebcamOpen((prevState) => !prevState)
                        }
                        size="sm"
                        variant="secondary"
                      >
                        Tutup Kamera
                      </Button>
                      <Button onClick={handleGetPicture} size="sm">
                        Ambil Gambar
                      </Button>
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
        <div className="flex justify-between p-4">
          {modalForm.readOnly && !isOwnerHasAccount ? (
            <Button
              onClick={() => setIsModalCreateAccountOpen(true)}
              variant="warning"
              disabled={isOwnerHasAccount}
            >
              + Akun Pengguna
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2 justify-end ">
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

      <Modal open={isModalCreateAccountOpen} title="Tambah Pengguna">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">
            Apakah anda ingin menambahkan akun pengguna untuk pemilik ini?
          </p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button
            onClick={() => setIsModalCreateAccountOpen(false)}
            variant="default"
          >
            Tidak
          </Button>
          <Button onClick={handleClickSubmitCreateAccount}>Ya</Button>
        </div>
      </Modal>

      {isLoadingSubmit && <LoadingOverlay />}

      <Toast
        open={toast.open}
        message={toast.message}
        timeout={5000}
        onClose={handleCloseToast}
      />
    </Layout>
  )
}

export default PageOwner
