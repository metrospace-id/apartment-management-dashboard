import {
  useState, useMemo, useEffect,
} from 'react'
import { fakerID_ID as faker } from '@faker-js/faker'

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

const PAGE_NAME = 'Izin Barang Keluar'

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
    label: 'Nama Pemohon',
    key: 'requester_name',
  },
  {
    label: 'Jenis Barang',
    key: 'item_category_name',
  },
  {
    label: 'Tanggal Keluar',
    key: 'start_date',
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
  name: faker.person.fullName(),
  phone_no: faker.helpers.fromRegExp(/081[0-9]{8}/),
  requester_name: faker.person.fullName(),
  requester_phone_no: faker.helpers.fromRegExp(/081[0-9]{8}/),
  requester_address: faker.location.streetAddress(),
  item_category_id: 1,
  item_desc: `Keterangan barang ${key + 1}`,
  start_date: '2023-12-31 00:00:00',
  end_date: '2024-12-31 00:00:00',
}))

const ITEM_CATEGORY_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  name: `Kategori Barang ${key + 1}`,
}))

const UNIT_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  unit_code: `A/${key + 1}/${key + 1}`,
  owner_name: faker.person.fullName(),
  phone_no: faker.helpers.fromRegExp(/081[0-9]{8}/),
  tower: 'A',
  unit_no: `${key + 1}`,
  floor_no: `${key + 1}`,
}))

function PageOutcomingItem() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
    id: 0,
    unit_id: 0,
    name: '',
    phone_no: '',
    requester_name: '',
    requester_phone_no: '',
    requester_address: '',
    item_category_id: 0,
    item_desc: '',
    start_date: dayjs().format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
  })
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    item_category_id: 0,
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
      name: '',
      phone_no: '',
      requester_name: '',
      requester_phone_no: '',
      requester_address: '',
      item_category_id: 0,
      item_desc: '',
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
    console.log(fieldData)
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      unit_id: fieldData.unit_id,
      name: fieldData.name,
      phone_no: fieldData.phone_no,
      requester_name: fieldData.requester_name,
      requester_phone_no: fieldData.requester_phone_no,
      requester_address: fieldData.requester_address,
      item_category_id: fieldData.item_category_id,
      item_desc: fieldData.item_desc,
      start_date: dayjs(fieldData.start_date).format('YYYY-MM-DD'),
      end_date: dayjs(fieldData.end_date).format('YYYY-MM-DD'),
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
      phone_no: fieldData.phone_no,
      requester_name: fieldData.requester_name,
      requester_phone_no: fieldData.requester_phone_no,
      requester_address: fieldData.requester_address,
      item_category_id: fieldData.item_category_id,
      item_desc: fieldData.item_desc,
      start_date: dayjs(fieldData.start_date).format('YYYY-MM-DD'),
      end_date: dayjs(fieldData.end_date).format('YYYY-MM-DD'),
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
      phone_no: fieldData.phone_no,
      requester_name: fieldData.requester_name,
      requester_phone_no: fieldData.requester_phone_no,
      requester_address: fieldData.requester_address,
      item_category_id: fieldData.item_category_id,
      item_desc: fieldData.item_desc,
      start_date: dayjs(fieldData.start_date).format('YYYY-MM-DD'),
      end_date: dayjs(fieldData.end_date).format('YYYY-MM-DD'),
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
      name: requesterName?.owner_name || '',
      phone_no: requesterName?.phone_no || '',
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
    name: column.name,
    requester_name: column.requester_name,
    item_category_name: ITEM_CATEGORY_DATA.find((cat) => cat.id === column.item_category_id)?.name,
    item_category_id: column.item_category_id,
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
          <DatePicker
            label="Tanggal Keluar"
            placeholder="Tanggal Keluar"
            name="start_date"
            value={fields.start_date ? dayjs(fields.start_date).toDate() : undefined}
            onChange={(selectedDate) => handleChangeFilterField('start_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
            readOnly={modalForm.readOnly}
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
            onChange={(value) => handleChangeUnitField('unit_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nama Penghuni"
            label="Nama Penghuni"
            value={fields.name}
            disabled
            fullWidth
          />

          <Input
            placeholder="No. Telp Penghuni"
            label="No. Telp Penghuni"
            value={fields.phone_no}
            disabled
            fullWidth
          />

          <Autocomplete
            placeholder="Jenis Barang"
            label="Jenis Barang"
            name="item_category_id"
            items={ITEM_CATEGORY_DATA.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: ITEM_CATEGORY_DATA.find((itemData) => itemData.id === fields.item_category_id)?.name || '',
              value: ITEM_CATEGORY_DATA.find((itemData) => itemData.id === fields.item_category_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('item_category_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <TextArea
            placeholder="Keterangan Barang"
            label="Keterangan Barang"
            name="item_desc"
            value={fields.item_desc}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
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
            name="requester_phone_no"
            type="tel"
            value={fields.requester_phone_no}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <TextArea
            placeholder="Alamat Pemohon"
            label="Alamat Pemohon"
            name="requester_address"
            value={fields.requester_address}
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
            <p className="text-sm font-medium text-slate-600 dark:text-white">Tanggal Keluar</p>
            <div className="flex flex-col gap-1">
              <DatePicker
                placeholder="Tanggal Awal"
                name="start_date"
                value={filter.start_date ? dayjs(filter.start_date).toDate() : undefined}
                onChange={(selectedDate) => handleChangeFilterField('start_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
                readOnly={modalForm.readOnly}
                fullWidth
              />

              <DatePicker
                placeholder="Tanggal Akhir"
                name="end_date"
                value={filter.end_date ? dayjs(filter.end_date).toDate() : undefined}
                onChange={(selectedDate) => handleChangeFilterField('end_date', dayjs(selectedDate).format('YYYY-MM-DD'))}
                readOnly={modalForm.readOnly}
                fullWidth
              />
            </div>
          </div>

          <Autocomplete
            placeholder="Jenis Barang"
            label="Jenis Barang"
            name="item_category_id"
            items={ITEM_CATEGORY_DATA.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: ITEM_CATEGORY_DATA.find((itemData) => itemData.id === filter.item_category_id)?.name || '',
              value: ITEM_CATEGORY_DATA.find((itemData) => itemData.id === filter.item_category_id)?.id || '',
            }}
            onChange={(value) => handleChangeFilterField('item_category_id', value.value)}
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

export default PageOutcomingItem
