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
import {
  ACCESS_CARD_DURATION,
  ACCESS_CARD_STATUS,
  VEHICLE_TYPE
} from 'constants/accessCard'
import { MODAL_CONFIRM_TYPE, PAGE_SIZE } from 'constants/form'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'
import { exportToExcel } from 'utils/export'

const REQUESTER_TYPE = [
  {
    label: 'Penghuni',
    value: '1'
  },
  {
    label: 'Penyewa',
    value: '2'
  }
]

const ACCESS_CARD_TYPE = [
  {
    label: 'Kartu Akses Parkir',
    value: '2'
  },
  {
    label: 'Kartu Akses Unit dan Parkir',
    value: '3'
  }
]

const PAGE_NAME = 'Kartu Akses Parkir'

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
    label: 'Jenis Kartu',
    key: 'type'
  },
  {
    label: 'Jenis Kendaraan',
    key: 'vehicle_type'
  },
  {
    label: 'Nopol Kendaraan',
    key: 'vehicle_license_plate'
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
    label: 'Tanggal Aktif',
    key: 'active_date',
    className: 'w-[100px]'
  },
  {
    label: 'Tanggal Kadaluwarsa',
    key: 'expired_date',
    className: 'w-[100px]'
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

const PageAccessCardParking = () => {
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
    type: 2,
    period_type: 1,
    period_value: 1,
    vehicle_type: '',
    vehicle_brand: '',
    vehicle_color: '',
    vehicle_license_plate: '',
    requester_name: '',
    requester_phone: '',
    requester_type: '',
    status: '',
    request_date: dayjs().format('YYYY-MM-DD'),
    expired_date: dayjs().add(1, 'year').format('YYYY-MM-DD')
  })
  const [filter, setFilter] = useState({
    type: 1,
    requester_type: '',
    vehicle_type: '',
    active_start_date: '',
    active_end_date: '',
    expired_start_date: '',
    expired_end_date: '',
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
  const [isModalHistoryOpen, setIsModalHistoryOpen] = useState(false)
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
      period_type: 1,
      period_value: 1,
      type: 2,
      vehicle_type: '',
      vehicle_brand: '',
      vehicle_color: '',
      vehicle_license_plate: '',
      requester_name: '',
      requester_phone: '',
      requester_type: '',
      status: '',
      request_date: dayjs().format('YYYY-MM-DD'),
      expired_date: dayjs().add(1, 'year').format('YYYY-MM-DD')
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

  const handleModalHistoryOpen = () => {
    setIsModalHistoryOpen(true)
    setModalForm((prevState) => ({
      ...prevState,
      open: false
    }))
  }

  const handleModalHistoryClose = () => {
    setIsModalHistoryOpen(false)
    setModalForm((prevState) => ({
      ...prevState,
      open: true
    }))
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
      period_type: fieldData.period_type,
      period_value: fieldData.period_value,
      type: fieldData.type,
      vehicle_id: fieldData.vehicle_id,
      vehicle_type: fieldData.vehicle_type,
      vehicle_brand: fieldData.vehicle_brand,
      vehicle_color: fieldData.vehicle_color,
      vehicle_license_plate: fieldData.vehicle_license_plate,
      requester_name: fieldData.requester_name,
      requester_phone: fieldData.requester_phone,
      requester_type: fieldData.requester_type,
      request_date: fieldData.request_date,
      expired_date: fieldData.expired_date,
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
      period_type: fieldData.period_type,
      period_value: fieldData.period_value,
      type: fieldData.type,
      vehicle_id: fieldData.vehicle_id,
      vehicle_type: fieldData.vehicle_type,
      vehicle_brand: fieldData.vehicle_brand,
      vehicle_color: fieldData.vehicle_color,
      vehicle_license_plate: fieldData.vehicle_license_plate,
      requester_name: fieldData.requester_name,
      requester_phone: fieldData.requester_phone,
      requester_type: fieldData.requester_type,
      request_date: fieldData.request_date,
      expired_date: fieldData.expired_date,
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

  const handleChangeLicenceNoField = (fieldName: string, value: string) => {
    handleChangeField(fieldName, value.toUpperCase().replace(/\s/g, ''))
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
        types: '2,3',
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
    type:
      ACCESS_CARD_TYPE.find((itemData) => itemData.value === column.type)
        ?.label || '',
    vehicle_type:
      VEHICLE_TYPE.find((itemData) => itemData.id === +column.vehicle_type)
        ?.label || '',
    vehicle_license_plate: column.vehicle_license_plate,
    requester_name: column.requester_name,
    requester_type:
      REQUESTER_TYPE.find(
        (itemData) => itemData.value === column.requester_type
      )?.label || '',
    active_date: column.active_date
      ? dayjs(column.active_date).format('YYYY-MM-DD')
      : '-',
    expired_date: column.expired_date
      ? dayjs(column.expired_date).format('YYYY-MM-DD')
      : '-',
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
        {userPermissions.includes('access-card-parking-edit') && (
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
        {userPermissions.includes('access-card-parking-delete') && (
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

          <div className="flex gap-4 flex-col sm:gap-2 sm:flex-row">
            <Input
              placeholder="Lama Periode Kartu"
              label="Lama Periode Kartu"
              name="period_value"
              value={fields.period_value}
              onChange={(e) =>
                handleChangeNumericField(e.target.name, e.target.value)
              }
              readOnly={modalForm.readOnly}
              fullWidth
              type="tel"
            />

            <Select
              placeholder="Jenis Periode Kartu"
              label="Jenis Periode Kartu"
              name="period_type"
              value={fields.period_type}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
              options={[
                {
                  label: 'Pilih Periode Kartu',
                  value: '',
                  disabled: true
                },
                ...ACCESS_CARD_DURATION.map((duration) => ({
                  value: duration.id,
                  label: duration.label
                }))
              ]}
            />
          </div>

          <Select
            placeholder="Jenis Kartu"
            label="Jenis Kartu"
            name="type"
            value={fields.type}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[
              {
                label: 'Pilih Jenis Kartu',
                value: '',
                disabled: true
              },
              ...ACCESS_CARD_TYPE.map((type) => ({
                value: type.value,
                label: type.label
              }))
            ]}
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
              ...REQUESTER_TYPE.map((itemData) => ({
                label: itemData.label,
                value: itemData.value
              }))
            ]}
          />

          <Select
            placeholder="Jenis Kendaraan"
            label="Jenis Kendaraan"
            name="vehicle_type"
            value={fields.vehicle_type}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[
              {
                label: 'Pilih Jenis Kendaraan',
                value: '',
                disabled: true
              },
              ...VEHICLE_TYPE.map((vehicle) => ({
                value: vehicle.id,
                label: vehicle.label
              }))
            ]}
          />

          <Input
            placeholder="Merk Kendaraan"
            label="Merk Kendaraan"
            name="vehicle_brand"
            value={fields.vehicle_brand}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Warna Kendaraan"
            label="Warna Kendaraan"
            name="vehicle_color"
            value={fields.vehicle_color}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nopol Kendaraan"
            label="Nopol Kendaraan"
            name="vehicle_license_plate"
            value={fields.vehicle_license_plate}
            onChange={(e) =>
              handleChangeLicenceNoField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
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
          {modalForm.readOnly && (
            <div className="ml-0 mr-auto">
              <Button onClick={handleModalHistoryOpen} variant="secondary">
                Histori
              </Button>
            </div>
          )}
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

      <Modal open={isModalHistoryOpen} title={`Histori ${PAGE_NAME}`}>
        <div className="p-6 overflow-scroll">
          <div className="border border-slate-200 dark:border-slate-700 rounded-md w-full max-h-[50vh] overflow-scroll">
            <table className="border-collapse min-w-full w-max relative">
              <thead>
                <tr className="text-center font-semibold text-slate-600 dark:text-white">
                  <td className="p-2">Jenis</td>
                  <td className="p-2">Merk</td>
                  <td className="p-2">Warna</td>
                  <td className="p-2">Nopol</td>
                </tr>
              </thead>
              <tbody>
                {/* {VEHICLE_DATA.map((vehicle) => (
                  <tr key={vehicle.id} className="text-center font-regular text-slate-500 dark:text-white odd:bg-sky-50 dark:odd:bg-sky-900">
                    <td className="p-2">
                      {getVehicleByType(vehicle.type)?.label}
                    </td>
                    <td className="p-2">
                      {vehicle.brand}
                    </td>
                    <td className="p-2">
                      {vehicle.color}
                    </td>
                    <td className="p-2">
                      {vehicle.licence_no}
                    </td>
                  </tr>
                ))} */}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex gap-2 justify-start p-4">
          <Button onClick={handleModalHistoryClose} variant="secondary">
            Kembali
          </Button>
        </div>
      </Modal>

      <Modal open={isModalFilterOpen} title="Filter" size="xs">
        <form autoComplete="off" className="grid grid-cols-1 gap-4 p-6">
          <Select
            placeholder="Jenis Kartu"
            label="Jenis Kartu"
            name="type"
            value={filter.type}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[
              {
                label: 'Pilih Jenis Kartu',
                value: '',
                disabled: true
              },
              ...ACCESS_CARD_TYPE.map((type) => ({
                value: type.value,
                label: type.label
              }))
            ]}
          />
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

          <div className="flex flex-col gap-2 w-full">
            <p className="text-sm font-medium text-slate-600 dark:text-white">
              Tanggal Kadaluwarsa
            </p>
            <div className="flex flex-col gap-1">
              <DatePicker
                placeholder="Tanggal Mulai"
                name="expired_start_date"
                value={
                  filter.expired_start_date
                    ? dayjs(filter.expired_start_date).toDate()
                    : undefined
                }
                onChange={(selectedDate) =>
                  handleChangeFilterField(
                    'expired_start_date',
                    dayjs(selectedDate).format('YYYY-MM-DD')
                  )
                }
                readOnly={modalForm.readOnly}
                fullWidth
              />

              <DatePicker
                placeholder="Tanggal Selesai"
                name="expired_end_date"
                value={
                  filter.expired_end_date
                    ? dayjs(filter.expired_end_date).toDate()
                    : undefined
                }
                onChange={(selectedDate) =>
                  handleChangeFilterField(
                    'expired_end_date',
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
              ...REQUESTER_TYPE.map((itemData) => ({
                label: itemData.label,
                value: itemData.value
              }))
            ]}
          />

          <Select
            placeholder="Jenis Kendaraan"
            label="Jenis Kendaraan"
            name="vehicle_type"
            value={filter.vehicle_type}
            onChange={(e) =>
              handleChangeFilterField(e.target.name, e.target.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
            options={[
              {
                label: 'Pilih Jenis Kendaraan',
                value: '',
                disabled: true
              },
              ...VEHICLE_TYPE.map((vehicle) => ({
                value: vehicle.id,
                label: vehicle.label
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

export default PageAccessCardParking
