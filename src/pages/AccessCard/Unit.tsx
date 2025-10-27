import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import Badge from 'components/Badge'
import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Autocomplete from 'components/Form/Autocomplete'
import DatePicker from 'components/Form/DatePicker'
import Input from 'components/Form/Input'
import Select from 'components/Form/Select'
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
import { ACCESS_CARD_STATUS } from 'constants/accessCard'
import { MODAL_CONFIRM_TYPE, PAGE_SIZE } from 'constants/form'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'
import { exportToExcel } from 'utils/export'

const REUQESTER_TYPE = [
  {
    label: 'Penghuni',
    value: '1'
  },
  {
    label: 'Penyewa',
    value: '2'
  }
]

const PAGE_NAME = 'Kartu Akses Unit'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No. Unit',
    key: 'unit_code'
  },
  {
    label: 'No. Kartu',
    key: 'card_no'
  },
  {
    label: 'No. RFID',
    key: 'rfid_no'
  },
  {
    label: 'Nama Pemohon',
    key: 'requester_name'
  },
  {
    label: 'Status Pemohon',
    key: 'requester_type'
  },
  {
    label: 'Status Kartu',
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
  const statusData = ACCESS_CARD_STATUS.find(
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
    variant = 'primary'
  }
  if (+status === 4) {
    variant = 'danger'
  }
  return {
    label,
    variant
  }
}

const PageAccessCardUnit = () => {
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
  const [fields, setFields] = useState({
    id: 0,
    unit_id: 0,
    card_no: '',
    rfid_no: '',
    requester_name: '',
    requester_phone: '',
    requester_type: '',
    status: '',
    type: 1,
    request_date: dayjs().format('YYYY-MM-DD')
  })
  const [filter, setFilter] = useState({
    requester_type: '',
    active_start_date: '',
    active_end_date: '',
    status: ''
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
      card_no: '',
      rfid_no: '',
      requester_name: '',
      requester_phone: '',
      requester_type: '',
      status: '',
      type: 1,
      request_date: dayjs().format('YYYY-MM-DD')
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

  const handleModalFilterOpen = () => {
    setIsModalFilterOpen(true)
  }

  const handleModalFilterClose = () => {
    setIsModalFilterOpen(false)
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
      card_no: fieldData.card_no,
      rfid_no: fieldData.rfid_no,
      requester_name: fieldData.requester_name,
      requester_phone: fieldData.requester_phone,
      requester_type: fieldData.requester_type,
      request_date: fieldData.request_date,
      status: fieldData.status
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
      card_no: fieldData.card_no,
      rfid_no: fieldData.rfid_no,
      requester_name: fieldData.requester_name,
      requester_phone: fieldData.requester_phone,
      requester_type: fieldData.requester_type,
      request_date: fieldData.request_date,
      status: fieldData.status
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

  const handleGetAccessCards = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/access-card',
      withAuth: true,
      method: 'GET',
      params: {
        type: 1,
        page,
        limit: PAGE_SIZE,
        search,
        requester_type: filter.requester_type,
        active_start_date: filter.active_start_date,
        active_end_date: filter.active_end_date,
        status: filter.status
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
      url: '/v1/access-card/create',
      withAuth: true,
      method: 'POST',
      data: fields
    })

  const apiSubmitUpdate = () =>
    api({
      url: `/v1/access-card/${fields.id}`,
      withAuth: true,
      method: 'PUT',
      data: fields
    })

  const apiSubmitDelete = () =>
    api({
      url: `/v1/access-card/${fields.id}`,
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
        handleGetAccessCards()
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
    handleGetAccessCards()
    handleModalFilterClose()
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    unit_code: column.unit_code,
    card_no: column.card_no,
    rfid_no: column.rfid_no,
    requester_name: column.requester_name,
    requester_type:
      REUQESTER_TYPE.find(
        (itemData) => itemData.value === column.requester_type
      )?.label || '',
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
        {userPermissions.includes('access-card-unit-edit') && (
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
        {userPermissions.includes('access-card-unit-delete') && (
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
    handleGetAccessCards()
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
              <Input
                placeholder="Cari no. unit, no. kartu"
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
          <DatePicker
            label="Tanggal Permohonan"
            placeholder="Tanggal Permohonan"
            name="request_date"
            value={
              fields.request_date
                ? dayjs(fields.request_date).toDate()
                : undefined
            }
            onChange={(selectedDate) =>
              handleChangeField(
                'request_date',
                dayjs(selectedDate).format('YYYY-MM-DD')
              )
            }
            readOnly
            fullWidth
          />

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
            placeholder="No. Kartu"
            label="No. Kartu"
            name="card_no"
            value={fields.card_no}
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
            type="tel"
          />

          <Input
            placeholder="No. RFID"
            label="No. RFID"
            name="rfid_no"
            value={fields.rfid_no}
            onChange={(e) =>
              handleChangeNumericField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
            type="tel"
          />

          <Input
            placeholder="Nama Pemohon"
            label="Nama Pemohon"
            name="requester_name"
            value={fields.requester_name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Telepon Pemohon"
            label="No. Telepon Pemohon"
            name="requester_phone"
            value={fields.requester_phone}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Select
            placeholder="Status Pemohon"
            label="Status Pemohon"
            name="requester_type"
            value={fields.requester_type}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[
              {
                label: 'Pilih Status',
                value: '',
                disabled: true
              },
              ...REUQESTER_TYPE.map((itemData) => ({
                label: itemData.label,
                value: itemData.value
              }))
            ]}
          />

          {!!fields.id && (
            <Select
              placeholder="Status Kartu"
              label="Status Kartu"
              name="status"
              value={fields.status}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
              options={[
                {
                  label: 'Pilih Status Kartu',
                  value: '',
                  disabled: true
                },
                ...ACCESS_CARD_STATUS.map((type) => ({
                  value: type.id,
                  label: type.label
                }))
              ]}
            />
          )}
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
              Tanggal Aktif
            </p>
            <div className="flex flex-col gap-1">
              <DatePicker
                placeholder="Tanggal Mulai"
                name="active_start_date"
                value={
                  filter.active_start_date
                    ? dayjs(filter.active_start_date).toDate()
                    : undefined
                }
                onChange={(selectedDate) =>
                  handleChangeFilterField(
                    'active_start_date',
                    dayjs(selectedDate).format('YYYY-MM-DD')
                  )
                }
                readOnly={modalForm.readOnly}
                fullWidth
              />

              <DatePicker
                placeholder="Tanggal Selesai"
                name="active_end_date"
                value={
                  filter.active_end_date
                    ? dayjs(filter.active_end_date).toDate()
                    : undefined
                }
                onChange={(selectedDate) =>
                  handleChangeFilterField(
                    'active_end_date',
                    dayjs(selectedDate).format('YYYY-MM-DD')
                  )
                }
                readOnly={modalForm.readOnly}
                fullWidth
              />
            </div>
          </div>

          <Select
            placeholder="Status Pemohon"
            label="Status Pemohon"
            name="requester_type"
            value={filter.requester_type}
            onChange={(e) =>
              handleChangeFilterField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
            options={[
              {
                label: 'Pilih Status',
                value: '',
                disabled: true
              },
              ...REUQESTER_TYPE.map((itemData) => ({
                label: itemData.label,
                value: itemData.value
              }))
            ]}
          />

          <Select
            placeholder="Status Kartu"
            label="Status Kartu"
            name="status"
            value={filter.status}
            onChange={(e) =>
              handleChangeFilterField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
            options={[
              {
                label: 'Pilih Status Kartu',
                value: '',
                disabled: true
              },
              ...ACCESS_CARD_STATUS.map((type) => ({
                value: type.id,
                label: type.label
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

      {isLoadingSubmit && <LoadingOverlay />}

      <Toast
        open={toast.open}
        message={toast.message}
        onClose={handleCloseToast}
      />
    </Layout>
  )
}

export default PageAccessCardUnit
