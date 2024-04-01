import {
  useState, useMemo, useEffect,
} from 'react'

import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Table from 'components/Table/Table'
import Button from 'components/Button'
import Modal from 'components/Modal'
import Input from 'components/Form/Input'
import Popover from 'components/Popover'
import { FileText as IconFile } from 'components/Icons'
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
import { getVehicleByType } from 'utils/accessCard'

const PAGE_NAME = 'List Kendaraan'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'No. Unit',
    key: 'unit_code',
  },
  {
    label: 'No. Kartu',
    key: 'card_no',
  },
  {
    label: 'No. RFID',
    key: 'rfid_no',
  },
  {
    label: 'Jenis Kendaraan',
    key: 'type',
  },
  {
    label: 'Merk Kendaraan',
    key: 'brand',
  },
  {
    label: 'Warna Kendaraan',
    key: 'color',
  },
  {
    label: 'Nopol Kendaraan',
    key: 'licence_no',
  },
  {
    label: 'Nama Pemohon',
    key: 'requester_name',
  },
  {
    label: 'Status Pemohon',
    key: 'requester_status',
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
  card_no: `000${key + 1}`,
  rfid_no: `000000${key + 1}`,
  card_type: 1,
  type: key % 2 ? 1 : 2,
  brand: 'Hitam',
  color: 'Mazda RX8',
  licence_no: `B${key + 1}AN`,
  requester_name: `Nama Penyewa ${key + 1}`,
  requester_status: 'Penyewa',
  request_date: '2023-12-31 00:00:00',
}))

const UNIT_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  unit_code: `A/${key + 1}/${key + 1}`,
  tower: 'A',
  unit_no: `${key + 1}`,
  floor_no: `${key + 1}`,
}))

function PageAccessCardVehicleList() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
    id: 0,
    unit_id: 0,
    card_no: '',
    rfid_no: '',
    requester_name: '',
    requester_status: '',
    request_date: dayjs().format('YYYY-MM-DD'),
  })
  const [filter, setFilter] = useState({
    requester_status: '',
    active_start_date: '',
    active_end_date: '',
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
      card_no: '',
      rfid_no: '',
      requester_name: '',
      requester_status: '',
      request_date: dayjs().format('YYYY-MM-DD'),
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
      readOnly: true,
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      unit_id: fieldData.unit_id,
      card_no: fieldData.card_no,
      rfid_no: fieldData.rfid_no,
      requester_name: fieldData.requester_name,
      requester_status: fieldData.requester_status,
      request_date: fieldData.request_date,
    }))
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

  const handleSubmitFilter = () => {
    setIsLoadingData(true)
    handleModalFilterClose()
    setTimeout(() => {
      setIsLoadingData(false)
    }, 500)
  }

  const tableDatas = TABLE_DATA.map((column) => ({
    id: column.id,
    unit_code: column.unit_code,
    card_no: column.card_no,
    rfid_no: column.rfid_no,
    type: getVehicleByType(column.type)?.label,
    brand: column.brand,
    color: column.color,
    licence_no: column.licence_no,
    requester_name: column.requester_name,
    requester_status: column.requester_status,
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
            <IconFile className="w-4 h-4" />
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
          (tableData) => tableData.rfid_no.toLowerCase().includes(debounceSearch.toLowerCase())
          || tableData.card_no.toLowerCase().includes(debounceSearch.toLowerCase())
          || tableData.unit_code.toLowerCase().includes(debounceSearch.toLowerCase()),
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
            <div className="w-full sm:w-[30%]">
              <Input placeholder="Cari no. unit, no. kartu, nopol" onChange={(e) => setSearch(e.target.value)} fullWidth />
            </div>
            <Button onClick={handleModalFilterOpen} variant="secondary">Filter</Button>
            <div className="sm:ml-auto flex gap-1">
              <Button onClick={handleExportExcel} variant="warning">Export</Button>
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
        <form autoComplete="off" className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6" onSubmit={() => handleClickConfirm(fields.id ? 'update' : 'create')}>
          <DatePicker
            label="Tanggal Permohonan"
            placeholder="Tanggal Permohonan"
            name="request_date"
            value={fields.request_date ? dayjs(fields.request_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('request_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly
            fullWidth
          />

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
            onChange={(value) => handleChangeField('unit_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Kartu"
            label="No. Kartu"
            name="card_no"
            value={fields.card_no}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            type="tel"
          />

          <Input
            placeholder="No. RFID"
            label="No. RFID"
            name="rfid_no"
            value={fields.rfid_no}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            type="tel"
          />

          <Input
            placeholder="Nama Pemohon"
            label="Nama Pemohon"
            name="requester_name"
            value={fields.requester_name}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Select
            placeholder="Status Pemohon"
            label="Status Pemohon"
            name="requester_status"
            value={fields.requester_status}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Status',
              value: '',
              disabled: true,
            },
            {
              label: 'Penghuni',
              value: 'Penghuni',
            },
            {
              label: 'Penyewa',
              value: 'Penyewa',
            }]}
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
          <Select
            placeholder="Status Pemohon"
            label="Status Pemohon"
            name="requester_status"
            value={filter.requester_status}
            onChange={(e) => handleChangeFilterField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Status',
              value: '',
              disabled: true,
            },
            {
              label: 'Penghuni',
              value: 'Penghuni',
            },
            {
              label: 'Penyewa',
              value: 'Penyewa',
            }]}
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

export default PageAccessCardVehicleList
