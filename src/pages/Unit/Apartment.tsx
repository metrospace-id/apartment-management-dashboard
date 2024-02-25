import { useState, useMemo, useEffect } from 'react'

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
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import Select from 'components/Form/Select'
import dayjs from 'dayjs'

const PAGE_NAME = 'Unit Apartment'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Unit ID',
    key: 'unit_code',
  },
  {
    label: 'Tower',
    key: 'tower',
  },
  {
    label: 'Nomor',
    key: 'unit_no',
  },
  {
    label: 'Lantai',
    key: 'floor_no',
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
  unit_code: `A/${key + 1}/${key + 1}`,
  tower: 'A',
  unit_no: `${key + 1}`,
  floor_no: `${key + 1}`,
}))

const OWNER_DATA = Array.from(Array(25).keys()).map((key) => ({
  id: key + 1,
  name: `Nama Pemilik ${key + 1}`,
  phone: `08123${key + 1}`,
  start_date: '2023-12-31 00:00:00',
  end_date: key % 2 ? '2024-12-31 00:00:00' : null,
}))

const TENANT_DATA = Array.from(Array(25).keys()).map((key) => ({
  id: key + 1,
  name: `Nama Penyewa ${key + 1}`,
  phone: `08123${key + 1}`,
  start_date: '2023-12-31 00:00:00',
  end_date: key % 2 ? '2024-12-31 00:00:00' : null,
}))

function PageUnitApartment() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
    id: 0,
    unit_no: '',
    floor_no: '',
    tower: '',
    unit_code: '',
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
  const [isModalHistoryOpen, setIsModalHistoryOpen] = useState(false)
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
      unit_no: '',
      floor_no: '',
      tower: '',
      unit_code: '',
    })
  }

  const handleModalHistoryOpen = () => {
    setIsModalHistoryOpen(true)
    setModalForm((prevState) => ({
      ...prevState,
      open: false,
    }))
  }

  const handleModalHistoryClose = () => {
    setIsModalHistoryOpen(false)
    setModalForm((prevState) => ({
      ...prevState,
      open: true,
    }))
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
      unit_no: fieldData.unit_no,
      tower: fieldData.tower,
      floor_no: fieldData.floor_no,
      unit_code: fieldData.unit_code,
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
      unit_no: fieldData.unit_no,
      tower: fieldData.tower,
      floor_no: fieldData.floor_no,
      unit_code: fieldData.unit_code,
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
      unit_no: fieldData.unit_no,
      tower: fieldData.tower,
      floor_no: fieldData.floor_no,
      unit_code: fieldData.unit_code,
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
    unit_code: column.unit_code,
    tower: column.tower,
    unit_no: column.unit_no,
    floor_no: column.floor_no,
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
          (tableData) => tableData.unit_code.toLowerCase().includes(debounceSearch.toLowerCase()),
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
              <Input placeholder="Cari tower, lantai, nomor" onChange={(e) => setSearch(e.target.value)} fullWidth />
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
            placeholder="Nomor Unit"
            label="Nomor Unit"
            name="unit_no"
            value={fields.unit_no}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Nomor Lantai"
            label="Nomor Lantai"
            name="floor_no"
            value={fields.floor_no}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Select
            options={[
              { label: 'Pilih Lantai', value: '', disabled: true },
              { label: 'A', value: 'A' },
              { label: 'B', value: 'B' },
              { label: 'C', value: 'C' },
            ]}
            placeholder="Tower"
            label="Tower"
            name="tower"
            value={fields.tower}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

        </form>
        <div className="flex gap-2 justify-end p-4">
          {modalForm.readOnly && (
            <div className="ml-0 mr-auto">
              <Button onClick={handleModalHistoryOpen} variant="secondary">Histori</Button>
            </div>
          )}
          <Button onClick={handleModalFormClose} variant="default">Tutup</Button>
          {!modalForm.readOnly && (
            <Button onClick={() => handleClickConfirm(fields.id ? 'update' : 'create')}>Kirim</Button>
          )}
        </div>
      </Modal>

      <Modal open={isModalHistoryOpen} title={`Histori ${PAGE_NAME}`}>
        <div className="p-6 flex gap-2 flex-col sm:flex-row overflow-scroll">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 dark:text-white">Histori Pemilik</p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-md w-max max-h-[50vh] overflow-scroll mt-2">
              <table className="border-collapse min-w-full w-max relative">
                <thead>
                  <tr className="text-center font-semibold text-slate-600 dark:text-white">
                    <td className="p-2">Nama</td>
                    <td className="p-2">No. Telepon</td>
                    <td className="p-2">Tgl Masuk</td>
                    <td className="p-2">Tgl Keluar</td>
                  </tr>
                </thead>
                <tbody>
                  {OWNER_DATA.map((owner) => (
                    <tr key={owner.id} className="text-center font-regular text-slate-500 dark:text-white odd:bg-sky-50 dark:odd:bg-sky-900">
                      <td className="p-2">
                        {owner.name}
                      </td>
                      <td className="p-2">
                        {owner.phone}
                      </td>
                      <td className="p-2">
                        {dayjs(owner.start_date).format('YYYY-MM-DD')}
                      </td>
                      <td className="p-2">
                        {owner.end_date ? dayjs(owner.end_date).format('YYYY-MM-DD') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-1 ">
            <p className="text-sm font-semibold text-slate-600 dark:text-white">Histori Penyewa</p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-md w-max max-h-[50vh] overflow-scroll mt-2">
              <table className="border-collapse min-w-full w-max relative">
                <thead>
                  <tr className="text-center font-semibold text-slate-600 dark:text-white">
                    <td className="p-2">Nama</td>
                    <td className="p-2">No. Telepon</td>
                    <td className="p-2">Tgl Masuk</td>
                    <td className="p-2">Tgl Keluar</td>
                  </tr>
                </thead>
                <tbody>
                  {TENANT_DATA.map((owner) => (
                    <tr key={owner.id} className="text-center font-regular text-slate-500 dark:text-white odd:bg-sky-50 dark:odd:bg-sky-900">
                      <td className="p-2">
                        {owner.name}
                      </td>
                      <td className="p-2">
                        {owner.phone}
                      </td>
                      <td className="p-2">
                        {dayjs(owner.start_date).format('YYYY-MM-DD')}
                      </td>
                      <td className="p-2">
                        {owner.end_date ? dayjs(owner.end_date).format('YYYY-MM-DD') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        <div className="flex gap-2 justify-start p-4">
          <Button onClick={handleModalHistoryClose} variant="secondary">Kembali</Button>
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

export default PageUnitApartment
