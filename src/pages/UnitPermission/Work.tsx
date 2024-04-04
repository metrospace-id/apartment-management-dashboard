import dayjs from 'dayjs'
import {
  useEffect,
  useState,
} from 'react'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Autocomplete from 'components/Form/Autocomplete'
import DatePicker from 'components/Form/DatePicker'
import Input from 'components/Form/Input'
import TextArea from 'components/Form/TextArea'
import { Edit as IconEdit, FileText as IconFile, TrashAlt as IconTrash } from 'components/Icons'
import Layout from 'components/Layout'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import Popover from 'components/Popover'
import type { TableHeaderProps } from 'components/Table/Table'
import Table from 'components/Table/Table'
import Toast from 'components/Toast'
import { MODAL_CONFIRM_TYPE, PAGE_SIZE } from 'constants/form'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'
import { exportToExcel } from 'utils/export'

const PAGE_NAME = 'Izin Kerja'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No Unit',
    key: 'unit_code',
  },
  {
    label: 'Nama Pemohon',
    key: 'requester_name',
  },
  {
    label: 'Nama Pekerja',
    key: 'worker_name',
  },
  {
    label: 'Jenis Pekerjaan',
    key: 'work_category',
  },
  {
    label: 'Tanggal Pekerjaan',
    key: 'start_date',
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true,
  },
]

function PageWork() {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  })
  const [dataUnits, setDataUnits] = useState<{
    unit_id: number,
    unit_code: string,
    owner_name: string,
    owner_phone: string,
    name: string,
    phone: string
  }[]>([])
  const [dataCategories, setDataCategories] = useState<{ id: number, name: string }[]>([])
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState({
    id: 0,
    unit_id: 0,
    requester_name: '',
    requester_phone: '',
    worker_name: '',
    worker_phone: '',
    work_category_id: 0,
    work_description: '',
    start_date: dayjs().format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
  })
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    work_category_id: 0,
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
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
      requester_name: '',
      requester_phone: '',
      worker_name: '',
      worker_phone: '',
      work_category_id: 0,
      work_description: '',
      start_date: dayjs().format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
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
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true,
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      unit_id: fieldData.unit_id,
      requester_name: fieldData.requester_name,
      requester_phone: fieldData.requester_phone,
      worker_name: fieldData.worker_name,
      worker_phone: fieldData.worker_phone,
      work_category_id: fieldData.work_category_id,
      work_description: fieldData.work_description,
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
      requester_name: fieldData.requester_name,
      requester_phone: fieldData.requester_phone,
      worker_name: fieldData.worker_name,
      worker_phone: fieldData.worker_phone,
      work_category_id: fieldData.work_category_id,
      work_description: fieldData.work_description,
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
      [fieldName]: value,
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

  const handleGetWorks = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/work',
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
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleGetAllUnits = () => {
    api({
      url: '/v1/tenant/unit',
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

  const handleGetAllWorkCategories = () => {
    api({
      url: '/v1/work-category',
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
          open: true,
          message: error.response?.data?.message,
        })
      })
  }

  const apiSubmitCreate = () => api({
    url: '/v1/work/create',
    withAuth: true,
    method: 'POST',
    data: fields,
  })

  const apiSubmitUpdate = () => api({
    url: `/v1/work/${fields.id}`,
    withAuth: true,
    method: 'PUT',
    data: fields,
  })

  const apiSubmitDelete = () => api({
    url: `/v1/work/${fields.id}`,
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
      handleGetWorks()
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
    handleGetWorks()
    handleModalFilterClose()
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    unit_code: column.unit_code,
    requester_name: column.requester_name,
    worker_name: column.worker_name,
    work_category: column.work_category_name,
    work_category_id: column.work_category_id,
    start_date: dayjs(column.start_date).format('YYYY-MM-DD'),
    end_date: dayjs(column.end_date).format('YYYY-MM-DD'),
    description: column.description,
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        {userPermissions.includes('unit-permission-work-edit') && (
        <Popover content="Ubah">
          <Button variant="primary" size="sm" icon onClick={() => handleModalUpdateOpen(column)}>
            <IconEdit className="w-4 h-4" />
          </Button>
        </Popover>
        )}
        {userPermissions.includes('unit-permission-work-delete') && (
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
    handleGetWorks()
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
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
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
              value: itemData.unit_id,
            }))}
            value={{
              label: dataUnits.find((itemData) => itemData.unit_id === fields.unit_id)?.unit_code || '',
              value: dataUnits.find((itemData) => itemData.unit_id === fields.unit_id)?.unit_id || '',
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
            placeholder="Nama Pekerja"
            label="Nama Pekerja"
            name="worker_name"
            value={fields.worker_name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Telepon Pekerja"
            label="No. Telepon Pekerja"
            name="worker_phone"
            type="tel"
            value={fields.worker_phone}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Mulai"
            placeholder="Tanggal Mulai"
            name="start_date"
            value={fields.start_date ? dayjs(fields.start_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('start_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Selesai"
            placeholder="Tanggal Selesai"
            name="end_date"
            value={fields.end_date ? dayjs(fields.end_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('end_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Jenis Pekerjaan"
            label="Jenis Pekerjaan"
            name="work_category_id"
            items={dataCategories.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: dataCategories.find((itemData) => itemData.id === fields.work_category_id)?.name || '',
              value: dataCategories.find((itemData) => itemData.id === fields.work_category_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('work_category_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <TextArea
            placeholder="Deskripsi Pekerjaan"
            label="Deskripsi Pekerjaan"
            name="work_description"
            value={fields.work_description}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

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
            <p className="text-sm font-medium text-slate-600 dark:text-white">Tanggal Mulai</p>
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

          <Autocomplete
            placeholder="Jenis Pekerjaan"
            label="Jenis Pekerjaan"
            name="work_category_id"
            items={dataCategories.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: dataCategories.find((itemData) => itemData.id === filter.work_category_id)?.name || '',
              value: dataCategories.find((itemData) => itemData.id === filter.work_category_id)?.id || '',
            }}
            onChange={(value) => handleChangeFilterField('work_category_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
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

      {isLoadingSubmit && (
        <LoadingOverlay />
      )}

      <Toast open={toast.open} message={toast.message} onClose={handleCloseToast} />

    </Layout>
  )
}

export default PageWork
