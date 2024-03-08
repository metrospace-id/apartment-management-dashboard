import { useState, useMemo, useEffect } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import dayjs from 'dayjs'

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
import { EXAMPLE_COMPONENTS, EXAMPLE_SUBMISSION } from 'constants/asset'

import { Form } from 'components/Form/FormBuilder'

const PAGE_NAME = 'Checklist Aset'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Kode',
    key: 'asset_code',
  },
  {
    label: 'Nama',
    key: 'asset_name',
  },
  {
    label: 'Tanggal',
    key: 'created_at',
  },
  {
    label: 'Oleh',
    key: 'created_by',
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
  asset_code: '01-01-01-2024-1',
  asset_name: `Aset ${key + 1}`,
  submission: JSON.stringify(EXAMPLE_SUBMISSION),
  created_at: '2024-31-12 00:00:00',
  created_by: 'Pegawai Engineering',
}))

const ASSET_DATA = Array.from(Array(100).keys()).map((key) => ({
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

function PageMaintenanceChecklist() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
    id: 0,
    asset_code: '',
    asset_name: '',
    created_by: '',
    submission: '',
    created_at: dayjs().format('YYYY-MM-DD'),
  })
  const [scannedCode, setScannedCode] = useState('')
  const [assetForm, setAssetForm] = useState('')
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
      asset_code: '',
      asset_name: '',
      created_by: '',
      submission: '',
      created_at: dayjs().format('YYYY-MM-DD'),
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
      asset_code: fieldData.asset_code,
      asset_name: fieldData.asset_name,
      created_at: fieldData.created_at,
      created_by: fieldData.created_by,
      submission: fieldData.submission,
    })
    setAssetForm(JSON.stringify(EXAMPLE_COMPONENTS))
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setModalForm({
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    setFields({
      id: fieldData.id,
      asset_code: fieldData.asset_code,
      asset_name: fieldData.asset_name,
      created_at: fieldData.created_at,
      created_by: fieldData.created_by,
      submission: fieldData.submission,
    })
    setAssetForm(JSON.stringify(EXAMPLE_COMPONENTS))
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
      asset_code: fieldData.asset_code,
      asset_name: fieldData.asset_name,
      created_at: fieldData.created_at,
      created_by: fieldData.created_by,
      submission: fieldData.submission,
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

  const handleScanCode = (text: string) => {
    const selectedAset = ASSET_DATA.find((item) => item.code === text)

    setFields((prevState) => ({
      ...prevState,
      code: selectedAset?.code || '',
      name: selectedAset?.name || '',
    }))

    setTimeout(() => {
      setScannedCode(text)
      setAssetForm(JSON.stringify(EXAMPLE_COMPONENTS))
    }, 500)
  }

  const handleOpenScanCode = () => {
    setScannedCode('')
    setAssetForm('')
  }

  const tableDatas = TABLE_DATA.map((column) => ({
    id: column.id,
    asset_code: column.asset_code,
    asset_name: column.asset_name,
    created_at: dayjs(column.created_at).format('YYYY-MM-DD'),
    created_by: column.created_by,
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
          (tableData) => tableData.asset_code.toLowerCase().includes(debounceSearch.toLowerCase())
          || tableData.asset_name.toLowerCase().includes(debounceSearch.toLowerCase()),
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
              <Input placeholder="Cari nama, kode" onChange={(e) => setSearch(e.target.value)} fullWidth />
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
        <form autoComplete="off" className="flex flex-col sm:flex-row gap-4 p-6">
          <div className="flex-1 flex flex-col gap-4">
            {modalForm.open && !fields.id && (
              !scannedCode ? (
                <Scanner
                  onResult={(text) => handleScanCode(text)}
                />
              ) : (
                <Button variant="primary" onClick={handleOpenScanCode}>
                  Scan Ulang
                </Button>
              )
            )}
            <Input
              placeholder="Kode Aset"
              label="Kode Aset"
              name="asset_code"
              value={fields.asset_code}
              readOnly
              fullWidth
            />
            <Input
              placeholder="Nama Aset"
              label="Nama Aset"
              name="asset_name"
              value={fields.asset_name}
              readOnly
              fullWidth
            />

            {!!fields.id && (
            <Input
              placeholder="Tanggal Maintenance"
              label="Tanggal Maintenance"
              value={dayjs(fields.created_at).format('YYYY-MM-DD')}
              readOnly
              fullWidth
            />
            )}
          </div>

          <div className="flex-1">
            <Form
              readOnly={modalForm.readOnly}
              formComponent={assetForm}
              onChange={(e) => handleChangeField('submission', JSON.stringify(e.data))}
              submission={JSON.parse(fields.submission || '[]')}
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

export default PageMaintenanceChecklist
