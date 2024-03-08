import { useState, useMemo, useEffect } from 'react'
import QRCode from 'react-qr-code'

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
import TextArea from 'components/Form/TextArea'

const PAGE_NAME = 'List Aset'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Nama',
    key: 'name',
  },
  {
    label: 'Golongan',
    key: 'group_name',
  },
  {
    label: 'Lokasi',
    key: 'location_name',
  },
  {
    label: 'Jenis',
    key: 'type_name',
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
  code: '01-01-01-2024-1',
  name: `Aset ${key + 1}`,
  group_id: key + 1,
  group_name: `Golongan ${key + 1}`,
  location_id: key + 1,
  location_name: `Lokasi ${key + 1}`,
  type_id: key + 1,
  type_name: `Jenis ${key + 1}`,
  year: '2024',
  brand: 'Samsung',
  notes: 'Lorem ipsum',
}))

const GROUP_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  name: `Golongan Aset ${key + 1}`,
}))

const LOCATION_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  name: `Lokasi Aset ${key + 1}`,
}))

const TYPE_DATA = Array.from(Array(100).keys()).map((key) => ({
  id: key + 1,
  name: `Jenis Aset ${key + 1}`,
}))

function PageAssetList() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
    id: 0,
    code: '',
    name: '',
    group_id: 0,
    location_id: 0,
    type_id: 0,
    year: '',
    brand: '',
    notes: '',
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: '',
  })
  const [search, setSearch] = useState('')
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
      code: '',
      name: '',
      group_id: 0,
      location_id: 0,
      type_id: 0,
      year: '',
      brand: '',
      notes: '',
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
      code: fieldData.code,
      name: fieldData.name,
      group_id: fieldData.group_id,
      location_id: fieldData.location_id,
      type_id: fieldData.type_id,
      year: fieldData.year,
      brand: fieldData.brand,
      notes: fieldData.notes,
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
      code: fieldData.code,
      name: fieldData.name,
      group_id: fieldData.group_id,
      location_id: fieldData.location_id,
      type_id: fieldData.type_id,
      year: fieldData.year,
      brand: fieldData.brand,
      notes: fieldData.notes,
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
      code: fieldData.code,
      name: fieldData.name,
      group_id: fieldData.group_id,
      location_id: fieldData.location_id,
      type_id: fieldData.type_id,
      year: fieldData.year,
      brand: fieldData.brand,
      notes: fieldData.notes,
    })
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

  const tableDatas = TABLE_DATA.map((column) => ({
    id: column.id,
    name: column.name,
    group_name: column.group_name,
    location_name: column.location_name,
    type_name: column.type_name,
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

      <Modal open={modalForm.open} title={modalForm.title}>
        <form autoComplete="off" className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          <Input
            placeholder="Nama Aset"
            label="Nama Aset"
            name="name"
            value={fields.name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Golongan Aset"
            label="Golongan Aset"
            name="group_id"
            items={GROUP_DATA.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: GROUP_DATA.find((itemData) => itemData.id === fields.group_id)?.name || '',
              value: GROUP_DATA.find((itemData) => itemData.id === fields.group_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('group_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Lokasi Aset"
            label="Lokasi Aset"
            name="location_id"
            items={LOCATION_DATA.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: LOCATION_DATA.find((itemData) => itemData.id === fields.group_id)?.name || '',
              value: LOCATION_DATA.find((itemData) => itemData.id === fields.group_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('location_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Jenis Aset"
            label="Jenis Aset"
            name="type_id"
            items={TYPE_DATA.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: TYPE_DATA.find((itemData) => itemData.id === fields.group_id)?.name || '',
              value: TYPE_DATA.find((itemData) => itemData.id === fields.group_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('type_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Merk Aset"
            label="Merk Aset"
            name="brand"
            value={fields.brand}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Tahun Aset"
            label="Tahun Aset"
            name="year"
            type="tel"
            value={fields.year}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <div className="sm:col-span-2">
            <TextArea
              placeholder="Note"
              label="Note"
              name="notes"
              value={fields.notes}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />
          </div>

          <Input
            placeholder="Code Aset"
            label="Code Aset"
            name="code"
            value={fields.code}
            readOnly
            fullWidth
          />

          <div className="">
            <p className="text-sm text-slate-600 font-medium mb-2">QR Code</p>

            <div className="w-full sm:w-[50%]">
              <QRCode
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                size={150}
                value={fields.code}
                viewBox="0 0 150 150"
              />
            </div>
          </div>

        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">Tutup</Button>
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

      {isLoadingSubmit && (
        <LoadingOverlay />
      )}

      <Toast open={toast.open} message={toast.message} onClose={handleCloseToast} />

    </Layout>
  )
}

export default PageAssetList
