import {
  useState, useMemo, useEffect, useRef,
} from 'react'

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
import dayjs from 'dayjs'
import Select from 'components/Form/Select'
import DatePicker from 'components/Form/DatePicker'
import Badge from 'components/Badge'
import TextArea from 'components/Form/TextArea'
import { toBase64 } from 'utils/file'
import api from 'utils/api'

const PAGE_NAME = 'Workorder Teknisi'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No. Inquiry',
    key: 'inquiry_number',
  },
  {
    label: 'Kategori',
    key: 'inquiry_category_name',
  },
  {
    label: 'Dibuat Oleh',
    key: 'created_by_name',
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

interface FieldProps {
  id?: number
  type: string
  unit_id: number
  inquiry_category_id: number
  requester_name: string
  requester_phone: string
  notes: string
  department_id: number | null
  department_admin_id: number | null
  department_employee_id: number | null
  images: {
    id: number | string
    url: string
  }[]
  progress_images: {
    id: number | string
    url: string
  }[]
  progress_notes: {
    id: number | string
    notes: string
    created_at: string
  }[]
  is_validated: number
  status: number
}

function PageInquiryWorkOrder() {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  })
  const [dataUsers, setDataUsers] = useState<{ id: number, name: string, roles: any[] }[]>([])
  const [dataCategories, setDataCategories] = useState<{ id: number, name: string }[]>([])
  const [dataDepartments, setDataDepartments] = useState<{ id: number, name: string }[]>([])
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState<FieldProps>({
    type: 'workorder',
    id: 0,
    unit_id: 0,
    inquiry_category_id: 0,
    requester_name: '',
    requester_phone: '',
    notes: '',
    department_id: null,
    department_admin_id: null,
    department_employee_id: null,
    images: [],
    progress_images: [],
    progress_notes: [],
    status: 0,
    is_validated: 0,
  })
  const [filter, setFilter] = useState({
    status: 0,
    start_date: '',
    end_date: '',
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
  const [isModalDeleteImageOpen, setIsModalDeleteImageOpen] = useState(false)
  const [isModalDeleteProgressImageOpen, setIsModalDeleteProgressImageOpen] = useState(false)
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
  const imageRef = useRef<any>(null)
  const progressImageRef = useRef<any>(null)
  const [selectedImage, setSelectedImage] = useState({ id: 0, picture: '' })
  const [selectedProgressImage, setSelectedProgressImage] = useState({ id: 0, picture: '' })
  const [progressNote, setProgressNote] = useState('')

  const debounceSearch = useDebounce(search, 500, () => setPage(1))

  const dataUserDepartmentAdmin = useMemo(() => dataUsers.filter((user) => user.roles.find((role) => (role.level === '1' || role.level === '2') && role.department_id === fields.department_id)), [dataUsers, fields.department_id])
  const dataUserDepartmentEmployee = useMemo(() => dataUsers.filter((user) => user.roles.find((role) => role.level === '3' && role.department_id === fields.department_admin_id)), [dataUsers, fields.department_admin_id])

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
    setProgressNote('')
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
      type: 'inquiry',
      id: 0,
      unit_id: 0,
      inquiry_category_id: 0,
      requester_name: '',
      requester_phone: '',
      notes: '',
      images: [],
      progress_images: [],
      progress_notes: [],
      department_id: null,
      department_admin_id: null,
      department_employee_id: null,
      status: 0,
      is_validated: 0,
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
      title: `Tambah ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    setFields((prevState) => ({
      ...prevState,
      requester_name: '-',
      requester_phone: '-',
    }))
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
      url: `/v1/inquiry/${fieldData.id}`,
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
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    api({
      url: `/v1/inquiry/${fieldData.id}`,
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

  const handleGetInquiries = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/inquiry',
      withAuth: true,
      method: 'GET',
      params: {
        type: 'workorder',
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

  const handleGetAllUsers = () => {
    api({
      url: '/v1/user',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
      },
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataUsers(responseData.data.data)
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

  const handleGetAllInquiryCategories = () => {
    api({
      url: '/v1/inquiry-category',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
      },
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataCategories(responseData.data.data)
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
    url: '/v1/inquiry/create',
    withAuth: true,
    method: 'POST',
    data: fields,
  })

  const apiSubmitUpdate = () => api({
    url: `/v1/inquiry/${fields.id}`,
    withAuth: true,
    method: 'PUT',
    data: fields,
  })

  const apiSubmitDelete = () => api({
    url: `/v1/inquiry/${fields.id}`,
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
      handleGetInquiries()
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
    handleGetInquiries()
    handleModalFilterClose()
  }

  const handleModalDeleteImageOpen = (fieldData: any) => {
    setIsModalDeleteImageOpen(true)
    setSelectedImage(fieldData)
  }

  const handleClickCancelDeleteImage = () => {
    setIsModalDeleteImageOpen(false)
    setSelectedImage({ id: 0, picture: '' })
  }

  const handleClickSubmitDeleteImage = () => {
    handleClickCancelDeleteImage()
    setIsLoadingSubmit(true)

    const newImages = fields.images.filter((image: any) => image.id !== selectedImage.id)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        variant: 'default',
        open: true,
        message: 'Berhasil menghapus foto.',
      })
      setFields((prevState) => ({
        ...prevState,
        images: newImages,
      }))
    }, 500)
  }

  const handleClickImageUpload = () => {
    imageRef.current.click()
  }

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const file = files[0]

      if ((file.type.includes('image')) && file.size < 500000) {
        toBase64(file).then((result) => {
          imageRef.current.value = null

          setFields((prevState) => ({
            ...prevState,
            images: [...prevState.images, {
              id: `temp-${prevState.images.length}`,
              url: result as string,
            }],
          }))
        })
      } else {
        const message = file.size > 500000 ? 'Ukuran file terlalu besar, silakan pilih file dibawah 500kb.' : 'Dokumen format tidak sesuai, silakan pilih format image.'
        setToast({
          variant: 'error',
          open: true,
          message,
        })
      }
    }
  }

  const handleModalDeleteProgressImageOpen = (fieldData: any) => {
    setIsModalDeleteProgressImageOpen(true)
    setSelectedProgressImage(fieldData)
  }

  const handleClickCancelDeleteProgressImage = () => {
    setIsModalDeleteProgressImageOpen(false)
    setSelectedProgressImage({ id: 0, picture: '' })
  }

  const handleClickSubmitDeleteProgressImage = () => {
    handleClickCancelDeleteProgressImage()
    setIsLoadingSubmit(true)

    const newImages = fields.progress_images.filter((image: any) => image.id !== selectedProgressImage.id)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        variant: 'default',
        open: true,
        message: 'Berhasil menghapus foto.',
      })
      setFields((prevState) => ({
        ...prevState,
        progress_images: newImages,
      }))
    }, 500)
  }

  const handleClickProgressImageUpload = () => {
    progressImageRef.current.click()
  }

  const handleProgressImageUpload = (files: FileList | null) => {
    if (files) {
      const file = files[0]

      if ((file.type.includes('image')) && file.size < 500000) {
        toBase64(file).then((result) => {
          progressImageRef.current.value = null

          setFields((prevState) => ({
            ...prevState,
            progress_images: [...prevState.progress_images, {
              id: `temp-${prevState.progress_images.length}`,
              url: result as string,
            }],
          }))
        })
      } else {
        const message = file.size > 500000 ? 'Ukuran file terlalu besar, silakan pilih file dibawah 500kb.' : 'Dokumen format tidak sesuai, silakan pilih format image.'
        setToast({
          variant: 'error',
          open: true,
          message,
        })
      }
    }
  }

  const handleAddProgressNote = () => {
    const newProgressNote = [...fields.progress_notes, { id: fields.progress_notes.length + 1, notes: progressNote, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') }]
    setProgressNote('')
    setFields((prevState) => ({
      ...prevState,
      progress_notes: newProgressNote,
    }))
  }

  const renderStatus = (status: number) => {
    if (status === 1) {
      return <Badge variant="default">Pending</Badge>
    }
    if (status === 2) {
      return <Badge variant="warning">Dalam Proses</Badge>
    }
    return <Badge variant="success">Selesai</Badge>
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    inquiry_number: column.inquiry_number,
    inquiry_category_name: column.inquiry_category_name,
    requester_name: column.requester_name,
    requester_phone: column.requester_phone,
    created_by_name: column.created_by_name,
    status: renderStatus(column.status + 1),
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        {userPermissions.includes('workorder-edit') && (
        <Popover content="Ubah">
          <Button variant="primary" size="sm" icon onClick={() => handleModalUpdateOpen(column)}>
            <IconEdit className="w-4 h-4" />
          </Button>
        </Popover>
        )}
        {userPermissions.includes('workorder-delete') && (
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
    handleGetInquiries()
  }, [debounceSearch, page])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser.permissions) {
        setUserPermissions(localStorageUser.permissions)
      }
    }, 500)

    handleGetAllDepartments()
    handleGetAllInquiryCategories()
    handleGetAllUsers()
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input placeholder="Cari no. unit, no. kartu" onChange={(e) => setSearch(e.target.value)} fullWidth />
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
        <form autoComplete="off" className="flex gap-4 p-6 flex-col lg:flex-row">
          <div className="flex flex-col gap-4 flex-1">
            <Autocomplete
              placeholder="Jenis Inquiry"
              label="Jenis Inquiry"
              name="inquiry_category_id"
              items={dataCategories.map((itemData) => ({
                label: itemData.name,
                value: itemData.id,
              }))}
              value={{
                label: dataCategories.find((itemData) => itemData.id === fields.inquiry_category_id)?.name || '',
                value: dataCategories.find((itemData) => itemData.id === fields.inquiry_category_id)?.id || '',
              }}
              onChange={(value) => handleChangeField('inquiry_category_id', +value.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />

            <TextArea
              placeholder="Note"
              label="Note"
              name="notes"
              value={fields.notes}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
              rows={3}
            />

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-600">
                Foto
              </p>
              {!modalForm.readOnly && (
              <div>
                <Button onClick={handleClickImageUpload} size="sm" variant="secondary">
                  Upload Foto
                </Button>
                <input ref={imageRef} type="file" hidden onChange={(e) => handleImageUpload(e.target.files)} />
              </div>
              )}
              <div className="flex gap-2">
                {fields.images.length ? fields.images.map((document: any) => {
                  if (document.id) {
                    return (
                      <div key={document.id} className="border border-slate-200 rounded hover:border-primary relative">
                        {!modalForm.readOnly && (
                        <span
                          className="rounded-full bg-red-500 absolute right-1 top-1 cursor-pointer p-2"
                          onClick={() => handleModalDeleteImageOpen(document)}
                          role="presentation"
                        >
                          <IconTrash className="text-white w-[12px] h-[12px]" />
                        </span>
                        )}
                        <img src={document.url.includes('/pdf') ? '/images/pdf.png' : document.url} alt="doc" className="w-[100px] h-[100px] object-contain" />
                      </div>
                    )
                  }
                  return null
                }) : (
                  <p className="text-sm text-slate-600">Belum ada foto</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <Autocomplete
              placeholder="Department"
              label="Department"
              name="department_id"
              items={dataDepartments.map((itemData) => ({
                label: itemData.name,
                value: itemData.id,
              }))}
              value={{
                label: dataDepartments.find((itemData) => itemData.id === fields.department_id)?.name || '',
                value: dataDepartments.find((itemData) => itemData.id === fields.department_id)?.id || '',
              }}
              onChange={(value) => handleChangeField('department_id', +value.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />

            <Autocomplete
              placeholder="Admin Department"
              label="Admin Department"
              name="department_admin_id"
              items={dataUserDepartmentAdmin.map((itemData) => ({
                label: itemData.name,
                value: itemData.id,
              }))}
              value={{
                label: dataUserDepartmentAdmin.find((itemData) => itemData.id === fields.department_admin_id)?.name || '',
                value: dataUserDepartmentAdmin.find((itemData) => itemData.id === fields.department_admin_id)?.id || '',
              }}
              onChange={(value) => handleChangeField('department_admin_id', +value.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />

            <Autocomplete
              placeholder="Karyawan Department"
              label="Karyawan Department"
              name="department_employee_id"
              items={dataUserDepartmentEmployee.map((itemData) => ({
                label: itemData.name,
                value: itemData.id,
              }))}
              value={{
                label: dataUserDepartmentEmployee.find((itemData) => itemData.id === fields.department_employee_id)?.name || '',
                value: dataUserDepartmentEmployee.find((itemData) => itemData.id === fields.department_employee_id)?.id || '',
              }}
              onChange={(value) => handleChangeField('department_employee_id', +value.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-600">
                Foto Pengerjaan
              </p>
              {!modalForm.readOnly && (
              <div>
                <Button onClick={handleClickProgressImageUpload} size="sm" variant="secondary">
                  Upload Foto
                </Button>
                <input ref={progressImageRef} type="file" hidden onChange={(e) => handleProgressImageUpload(e.target.files)} />
              </div>
              )}
              <div className="flex gap-2">
                {fields.progress_images.length ? fields.progress_images.map((document: any) => {
                  if (document.id) {
                    return (
                      <div key={document.id} className="border border-slate-200 rounded hover:border-primary relative">
                        {!modalForm.readOnly && (
                        <span
                          className="rounded-full bg-red-500 absolute right-1 top-1 cursor-pointer p-2"
                          onClick={() => handleModalDeleteProgressImageOpen(document)}
                          role="presentation"
                        >
                          <IconTrash className="text-white w-[12px] h-[12px]" />
                        </span>
                        )}
                        <img src={document.url.includes('/pdf') ? '/images/pdf.png' : document.url} alt="doc" className="w-[100px] h-[100px] object-contain" />
                      </div>
                    )
                  }
                  return null
                }) : (
                  <p className="text-sm text-slate-600">Belum ada foto</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-600">
                Note Pengerjaan
              </p>
              <div className="">
                {fields.progress_notes.map((note: any) => (
                  <div key={note.id} className="relative flex gap-4 dark:text-white text-slate-600 dark:last:text-sky-600 last:text-sky-600 last:after:border-sky-600 after:border-slate-600 after:border-l-2 after:content-[''] after:absolute after:top-[14px] after:left-[5px] after:right-0 after:bottom-0 pb-4">
                    <div className="font-medium text-xs w-[150px]">
                      <p>
                        ◉
                        &nbsp;
                        {dayjs(note.created_at).format('DD MMM YYYY HH:mm')}
                      </p>
                    </div>
                    <div className="font-normal text-xs flex-1">
                      <p>{note.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
              {!modalForm.readOnly && (
                <div className="flex gap-4">
                  <div className="w-[150px]">
                    <Button onClick={handleAddProgressNote} className="w-full" size="sm" variant="secondary">
                      Tambah Note
                    </Button>
                  </div>
                  <div className="flex-1">
                    <textarea onChange={(e) => setProgressNote(e.target.value)} value={progressNote} className="w-full border-1 rounded border-slate-400 font-medium text-xs p-2 text-slate-600" />
                  </div>
                </div>
              )}
            </div>

            <Select
              placeholder="Status Inquiry"
              label="Status Inquiry"
              name="status"
              value={filter.status}
              onChange={(e) => handleChangeFilterField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
              options={[{
                label: 'Pilih Status',
                value: '',
                disabled: true,
              },
              {
                label: 'Dalam Progress',
                value: 1,
              },
              {
                label: 'Selesai',
                value: 2,
              }]}
            />

            <Select
              placeholder="Admin Validation"
              label="Admin Validation"
              name="status"
              value={filter.status}
              onChange={(e) => handleChangeFilterField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
              options={[{
                label: 'Pilih Validasi',
                value: '',
                disabled: true,
              },
              {
                label: 'Diterima',
                value: 3,
              },
              {
                label: 'Ditolak',
                value: 1,
              }]}
            />
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
            <p className="text-sm font-medium text-slate-600 dark:text-white">Tanggal Inquiry</p>
            <div className="flex flex-col gap-1">
              <DatePicker
                placeholder="Tanggal Mulai"
                name="start_date"
                value={filter.start_date ? dayjs(filter.start_date).toDate() : undefined}
                onChange={(selectedDate) => handleChangeFilterField('start_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
                readOnly={modalForm.readOnly}
                fullWidth
              />

              <DatePicker
                placeholder="Tanggal Selesai"
                name="end_date"
                value={filter.end_date ? dayjs(filter.end_date).toDate() : undefined}
                onChange={(selectedDate) => handleChangeFilterField('end_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
                readOnly={modalForm.readOnly}
                fullWidth
              />
            </div>
          </div>

          <Select
            placeholder="Status Inquiry"
            label="Status Inquiry"
            name="status"
            value={filter.status}
            onChange={(e) => handleChangeFilterField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Status',
              value: '',
              disabled: true,
            },
            {
              label: 'Dalam Progress',
              value: 1,
            },
            {
              label: 'Selesai',
              value: 2,
            }]}
          />
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFilterClose} variant="default">Tutup</Button>
          <Button onClick={handleSubmitFilter}>Kirim</Button>
        </div>
      </Modal>

      <Modal open={isModalDeleteImageOpen} title="Hapus Foto" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">Apa anda yakin ingin menghapus foto?</p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeleteImage} variant="default">Kembali</Button>
          <Button onClick={handleClickSubmitDeleteImage}>Ya</Button>
        </div>
      </Modal>

      <Modal open={isModalDeleteProgressImageOpen} title="Hapus Foto" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">Apa anda yakin ingin menghapus foto?</p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeleteProgressImage} variant="default">Kembali</Button>
          <Button onClick={handleClickSubmitDeleteProgressImage}>Ya</Button>
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

      {isLoadingSubmit && (
        <LoadingOverlay />
      )}

      <Toast open={toast.open} message={toast.message} onClose={handleCloseToast} />

    </Layout>
  )
}

export default PageInquiryWorkOrder
