import { useState, useMemo, useEffect } from 'react'

import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Table from 'components/Table/Table'
import Badge from 'components/Badge'
import Button from 'components/Button'
import Modal from 'components/Modal'
import Input from 'components/Form/Input'
import Popover from 'components/Popover'
import { Edit as IconEdit, TrashAlt as IconTrash, FileText as IconFile } from 'components/Icons'
import type { TableHeaderProps } from 'components/Table/Table'
import useDebounce from 'hooks/useDebounce'
import Toggle from 'components/Form/Toggle'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Toast from 'components/Toast'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import api from 'utils/api'

const PAGE_NAME = 'User'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Nama',
    key: 'name',
  },
  {
    label: 'Email',
    key: 'email',
  },
  {
    label: 'Role',
    key: 'role',
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true,
  },
]

interface FieldProps {
  id: number
  name: string
  email: string
  role_ids: number[]
}

function PageUser() {
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  })
  const [dataRoles, setDataRoles] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState<FieldProps>({
    id: 0,
    name: '',
    email: '',
    role_ids: [],
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
      name: '',
      email: '',
      role_ids: [0],
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

  const handleModalDetailOpen = (selectedData: any) => {
    setIsLoadingData(true)
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true,
    })
    api({
      url: `/v1/user/${selectedData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      const mapData = {
        id: responseData.data.id,
        name: responseData.data.name,
        email: responseData.data.email,
        role_ids: responseData.data.roles.map((role: any) => role.id),
      }
      setFields(mapData)
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

  const handleModalUpdateOpen = (selectedData: any) => {
    setIsLoadingData(true)
    setModalForm({
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    api({
      url: `/v1/user/${selectedData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      const mapData = {
        id: responseData.data.id,
        name: responseData.data.name,
        email: responseData.data.email,
        role_ids: responseData.data.roles.map((role: any) => role.id),
      }
      setFields(mapData)
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

  const handleModalDeleteOpen = (selectedData: any) => {
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE.delete.title,
      description: MODAL_CONFIRM_TYPE.delete.description,
      open: true,
    })
    setSubmitType('delete')
    setFields((prevState) => ({
      ...prevState,
      id: selectedData.id,
    }))
  }

  const handleSelectRoles = (roleId: number) => {
    if (!modalForm.readOnly) {
      if (fields.role_ids.includes(roleId)) {
        setFields((prevState) => ({
          ...prevState,
          role_ids: prevState.role_ids.filter((role) => role !== roleId),
        }))
      } else {
        setFields((prevState) => ({
          ...prevState,
          role_ids: [...prevState.role_ids, roleId],
        }))
      }
    }
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

  const handleGetUsers = () => {
    api({
      url: '/v1/user',
      withAuth: true,
      params: {
        page,
        limit: PAGE_SIZE,
        search,
      },
    }).then(({ data: responseData }) => {
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

  const handleGetAllRoles = () => {
    api({
      url: '/v1/role',
      withAuth: true,
      params: {
        limit: 9999,
      },
    }).then(({ data: responseData }) => {
      if (responseData.data?.data?.length) {
        setDataRoles(responseData.data.data)
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
    url: '/v1/user/create',
    withAuth: true,
    method: 'POST',
    data: {
      name: fields.name,
      email: fields.email,
      role_ids: fields.role_ids,
    },
  })

  const apiSubmitUpdate = () => api({
    url: `/v1/user/${fields.id}`,
    withAuth: true,
    method: 'PUT',
    data: {
      name: fields.name,
      role_ids: fields.role_ids,
    },
  })

  const apiSubmitDelete = () => api({
    url: `/v1/user/${fields.id}`,
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

    apiSubmit()
      .then(() => {
        handleGetUsers()
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
      })
      .finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    name: column.name,
    email: column.email,
    role: (
      <div className="">
        {column.roles.map((role: any) => (
          <Badge className="mx-1" key={role.id}>
            {role.name}
          </Badge>
        ))}
      </div>
    ),
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        {column.id !== 1 && (
          <>
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
          </>
        )}
      </div>
    ),
  }))

  useEffect(() => {
    handleGetUsers()
  }, [debounceSearch, page])

  useEffect(() => {
    handleGetAllRoles()
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input placeholder="Cari nama, email" onChange={(e) => setSearch(e.target.value)} fullWidth />
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
        <form autoComplete="off" className="flex flex-col gap-4 p-6">
          <Input
            placeholder="email@domain.com"
            label="Email"
            name="email"
            value={fields.email}
            disabled={fields.id !== 0}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />
          <Input
            placeholder="Nama"
            label="Nama"
            name="name"
            value={fields.name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />
          <div>
            <p className="text-sm text-slate-600 font-medium">Pilih Role</p>
            <div className="grid grid-cols-2 mt-2 sm:grid-cols-4 gap-4">
              {dataRoles.map((role) => (
                <Toggle
                  key={role.value}
                  label={role.name}
                  checked={fields.role_ids.includes(role.id)}
                  onChange={() => handleSelectRoles(role.id)}
                />
              ))}
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

export default PageUser
