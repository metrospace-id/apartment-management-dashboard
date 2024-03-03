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
import { Edit as IconEdit, TrashAlt as IconTrash, FileText as IconFile } from 'components/Icons'
import type { TableHeaderProps } from 'components/Table/Table'
import useDebounce from 'hooks/useDebounce'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Toast from 'components/Toast'
import Autocomplete from 'components/Form/Autocomplete'
import DatePicker from 'components/Form/DatePicker'
import TextArea from 'components/Form/TextArea'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import { exportToExcel } from 'utils/export'
import dayjs from 'dayjs'

const PAGE_NAME = 'Izin Renovasi'

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
    label: 'Total Pekerja',
    key: 'worker_total',
  },
  {
    label: 'Jenis Renovasi',
    key: 'renovation_category',
  },
  {
    label: 'Tanggal Mulai',
    key: 'start_date',
  },
  {
    label: 'Tanggal Selsai',
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
  requester_name: `Nama Pemilik ${key + 1}`,
  contractor_name: `Nama Kontraktor ${key + 1}`,
  worker_total: 5,
  pic_name: `Nama Penanggung Jawab ${key + 1}`,
  pic_phone: `08123${key + 1}`,
  supervisor_name: `Nama Pengawas ${key + 1}`,
  supervisor_phone: `08123${key + 1}`,
  renovation_category_id: 1,
  description: `Deskripsi pekerjaan ${key + 1}`,
  start_date: '2023-12-31 00:00:00',
  end_date: '2024-12-31 00:00:00',
}))

const RENOVATION_CATEGORY_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  name: `Kategori Renovasi ${key + 1}`,
}))

const UNIT_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  unit_code: `A/${key + 1}/${key + 1}`,
  owner_name: `Nama Pemilik ${key + 1}`,
  tower: 'A',
  unit_no: `${key + 1}`,
  floor_no: `${key + 1}`,
}))

function PageRenovation() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
    id: 0,
    unit_id: 0,
    requester_name: '',
    contractor_name: '',
    worker_total: 0,
    pic_name: '',
    pic_phone: '',
    supervisor_name: '',
    supervisor_phone: '',
    renovation_category_id: 0,
    start_date: dayjs().format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
    description: '',
  })
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    renovation_category_id: 0,
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
      requester_name: '',
      contractor_name: '',
      worker_total: 0,
      pic_name: '',
      pic_phone: '',
      supervisor_name: '',
      supervisor_phone: '',
      renovation_category_id: 0,
      start_date: dayjs().format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
      description: '',
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
      contractor_name: fieldData.contractor_name,
      worker_total: fieldData.worker_total,
      pic_name: fieldData.pic_name,
      pic_phone: fieldData.pic_phone,
      supervisor_name: fieldData.supervisor_name,
      supervisor_phone: fieldData.supervisor_phone,
      renovation_category_id: fieldData.renovation_category_id,
      start_date: fieldData.start_date,
      end_date: fieldData.end_date,
      description: fieldData.description,
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
      contractor_name: fieldData.contractor_name,
      worker_total: fieldData.worker_total,
      pic_name: fieldData.pic_name,
      pic_phone: fieldData.pic_phone,
      supervisor_name: fieldData.supervisor_name,
      supervisor_phone: fieldData.supervisor_phone,
      renovation_category_id: fieldData.renovation_category_id,
      start_date: fieldData.start_date,
      end_date: fieldData.end_date,
      description: fieldData.description,
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
      requester_name: fieldData.requester_name,
      contractor_name: fieldData.contractor_name,
      worker_total: fieldData.worker_total,
      pic_name: fieldData.pic_name,
      pic_phone: fieldData.pic_phone,
      supervisor_name: fieldData.supervisor_name,
      supervisor_phone: fieldData.supervisor_phone,
      renovation_category_id: fieldData.renovation_category_id,
      start_date: fieldData.start_date,
      end_date: fieldData.end_date,
      description: fieldData.description,
    }))
  }

  const handleChangePage = (pageNumber: number) => {
    setIsLoadingData(true)
    setTimeout(() => {
      setIsLoadingData(false)
      setPage(pageNumber - 1)
    }, 500)
  }

  const handleChangeUnitField = (fieldName: string, value: string | number) => {
    const requesterName = UNIT_DATA.find((unit) => unit.id === value)
    setFields((prevState) => ({
      ...prevState,
      requester_name: requesterName?.owner_name || '',
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
    requester_name: column.requester_name,
    contractor_name: column.contractor_name,
    worker_total: column.worker_total,
    renovation_category: RENOVATION_CATEGORY_DATA.find((cat) => cat.id === column.renovation_category_id)?.name,
    renovation_category_id: column.renovation_category_id,
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
          (tableData) => tableData.requester_name.toLowerCase().includes(debounceSearch.toLowerCase())
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
            placeholder="Nama Kontraktor"
            label="Nama Kontraktor"
            name="contractor_name"
            value={fields.contractor_name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Jumlah Pekerja"
            label="Jumlah Pekerja"
            name="worker_total"
            type="tel"
            value={fields.worker_total}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nama Penanggung Jawab"
            label="Nama Penanggung Jawab"
            name="pic_name"
            value={fields.pic_name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Telepon Penanggung Jawab"
            label="No. Telepon Penanggung Jawab"
            name="pic_phone"
            type="tel"
            value={fields.pic_phone}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nama Pengawas"
            label="Nama Pengawas"
            name="supervisor_name"
            value={fields.supervisor_name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="No. Telepon Pengawas"
            label="No. Telepon Pengawas"
            name="supervisor_phone"
            type="tel"
            value={fields.supervisor_phone}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Mulai"
            placeholder="Tanggal Mulai"
            name="start_date"
            value={fields.start_date ? dayjs(fields.start_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeFilterField('start_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <DatePicker
            label="Tanggal Selesai"
            placeholder="Tanggal Selesai"
            name="end_date"
            value={fields.end_date ? dayjs(fields.end_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeFilterField('end_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Jenis Renovasi"
            label="Jenis Renovasi"
            name="renovation_category_id"
            items={RENOVATION_CATEGORY_DATA.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: RENOVATION_CATEGORY_DATA.find((itemData) => itemData.id === fields.renovation_category_id)?.name || '',
              value: RENOVATION_CATEGORY_DATA.find((itemData) => itemData.id === fields.renovation_category_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('renovation_category_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <TextArea
            placeholder="Deskripsi Renovasi"
            label="Deskripsi Renovasi"
            name="description"
            value={fields.description}
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
            placeholder="Jenis Renovasi"
            label="Jenis Renovasi"
            name="renovation_category_id"
            items={RENOVATION_CATEGORY_DATA.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: RENOVATION_CATEGORY_DATA.find((itemData) => itemData.id === filter.renovation_category_id)?.name || '',
              value: RENOVATION_CATEGORY_DATA.find((itemData) => itemData.id === filter.renovation_category_id)?.id || '',
            }}
            onChange={(value) => handleChangeFilterField('renovation_category_id', value.value)}
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

export default PageRenovation
