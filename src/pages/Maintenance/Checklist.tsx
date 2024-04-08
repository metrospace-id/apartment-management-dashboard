import { Scanner } from '@yudiel/react-qr-scanner'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import Badge from 'components/Badge'
import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import { Form } from 'components/Form/FormBuilder'
import Input from 'components/Form/Input'
import Select from 'components/Form/Select'
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

const renderStatusLabel = (status: number) => {
  const statusData = [{
    label: 'Pending',
    value: 1,
  },
  {
    label: 'Approve',
    value: 2,
  }].find((itemData) => itemData.value === status)

  const label = statusData?.label || '-'

  let variant = 'default'
  if (+status === 1) {
    variant = 'warning'
  }
  if (+status === 2) {
    variant = 'success'
  }

  return {
    label,
    variant,
  }
}

function PageMaintenanceChecklist() {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  })
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState({
    id: 0,
    type: 2,
    asset_id: 0,
    asset_code: '',
    asset_name: '',
    checklist_form: '',
    created_by: '',
    submission: '',
    status: 1,
    created_at: dayjs().format('YYYY-MM-DD'),
  })
  const [scannedCode, setScannedCode] = useState('')
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
  const [currentStatus, setCurrentStatus] = useState(0)

  const debounceSearch = useDebounce(search, 500, () => setPage(1))

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
      type: 2,
      asset_id: 0,
      asset_code: '',
      asset_name: '',
      created_by: '',
      checklist_form: '',
      submission: '',
      status: 1,
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
    setIsLoadingData(true)
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
    }))
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true,
    })
    api({
      url: `/v1/maintenance/${fieldData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      setFields((prevState) => ({
        ...prevState,
        ...responseData.data,
      }))
      setCurrentStatus(+responseData.data.status)
      setIsLoadingData(false)
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

  const handleModalUpdateOpen = (fieldData: any) => {
    setIsLoadingData(true)
    setModalForm({
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
    }))
    api({
      url: `/v1/maintenance/${fieldData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      setFields((prevState) => ({
        ...prevState,
        ...responseData.data,
      }))
      setCurrentStatus(+responseData.data.status)
      setIsLoadingData(false)
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

  const handleGetChecklists = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/maintenance',
      withAuth: true,
      method: 'GET',
      params: {
        type: '2',
        page,
        limit: PAGE_SIZE,
        search,
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

  const apiSubmitCreate = () => api({
    url: '/v1/maintenance/create',
    withAuth: true,
    method: 'POST',
    data: fields,
  })

  const apiSubmitUpdate = () => api({
    url: `/v1/maintenance/${fields.id}`,
    withAuth: true,
    method: 'PUT',
    data: fields,
  })

  const apiSubmitDelete = () => api({
    url: `/v1/maintenance/${fields.id}`,
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
      handleGetChecklists()
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

  const handleScanCode = (code: string) => {
    api({
      url: `/v1/asset/code/${code}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      setFields((prevState) => ({
        ...prevState,
        checklist_form: responseData?.data.checklist_form || '',
        asset_id: responseData?.data.id || 0,
        asset_code: responseData?.data.code || '',
        asset_name: responseData?.data.name || '',
      }))
      setScannedCode(code)
      setIsLoadingData(false)
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

  const handleOpenScanCode = () => {
    setScannedCode('')
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    asset_code: column.asset_code,
    asset_name: column.asset_name,
    created_at: dayjs(column.created_at).format('YYYY-MM-DD'),
    created_by_name: column.created_by_name,
    status: <Badge variant={renderStatusLabel(column.status).variant as any}>{renderStatusLabel(column.status).label}</Badge>,
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        {userPermissions.includes('checklist-edit') && (
        <Popover content="Ubah">
          <Button variant="primary" size="sm" icon onClick={() => handleModalUpdateOpen(column)}>
            <IconEdit className="w-4 h-4" />
          </Button>
        </Popover>
        )}
        {userPermissions.includes('checklist-delete') && (
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
    handleGetChecklists()
  }, [debounceSearch, page])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser.permissions) {
        setUserPermissions(localStorageUser.permissions)
      }
    }, 500)
  }, [])

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
              placeholder="Tanggal Checklist"
              label="Tanggal Checklist"
              value={dayjs(fields.created_at).format('YYYY-MM-DD')}
              readOnly
              fullWidth
            />
            )}

            {!!fields.id && (
            <Select
              placeholder="Status"
              label="Status"
              name="status"
              value={fields.status}
              onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly || currentStatus > 1}
              fullWidth
              options={[{
                label: 'Pilih Status',
                value: '',
                disabled: true,
              },
              {
                label: 'Pending',
                value: 1,
              },
              {
                label: 'Approve',
                value: 2,
              },
              ]}
            />
            )}
          </div>

          <div className="flex-1">
            <Form
              readOnly={modalForm.readOnly || currentStatus > 1}
              formComponent={fields.checklist_form}
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
