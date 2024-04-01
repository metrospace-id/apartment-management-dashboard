import { useState, useEffect } from 'react'

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
import Toggle from 'components/Form/Toggle'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Toast from 'components/Toast'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import Select from 'components/Form/Select'
import api from 'utils/api'

const PAGE_NAME = 'Role'

const LEVELS = [
  { level: '0', label: 'Super Admin' },
  { level: '1', label: 'Admin Department' },
  { level: '2', label: 'Supervisor' },
  { level: '3', label: 'Karyawan' },
]

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Nama',
    key: 'name',
  },
  {
    label: 'Level',
    key: 'level',
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
  level: string
  permission_ids: number[]
}

function PageRole() {
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  })
  const [dataPermissions, setDataPermissions] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState<FieldProps>({
    id: 0,
    name: '',
    level: '',
    permission_ids: [],
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
      level: '',
      permission_ids: [],
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
      url: `/v1/role/${selectedData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      const mapData = {
        id: responseData.data.id,
        name: responseData.data.name,
        level: responseData.data.level,
        permission_ids: responseData.data.permissions.map((permission: any) => permission.id),
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
      url: `/v1/role/${selectedData.id}`,
      withAuth: true,
    }).then(({ data: responseData }) => {
      const mapData = {
        id: responseData.data.id,
        name: responseData.data.name,
        level: responseData.data.level,
        permission_ids: responseData.data.permissions.map((permission: any) => permission.id),
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

  const handleSelectPermission = (permission: any) => {
    if (!modalForm.readOnly) {
      const newPermissions = [...fields.permission_ids]
      const permissionId = permission.id
      const permissionChildren = permission.children || []
      const permissionChildrenIds = permissionChildren.map((child: any) => child.id)
      const permissionSubChildren = permissionChildren.flatMap((child: any) => child.children || [])
      const permissionSubChildrenIds = permissionSubChildren.map((subChild: any) => subChild.id)

      if (newPermissions.includes(permissionId)) {
        const filteredPermissions = newPermissions.filter((id) => id !== permissionId)
        const filteredChildren = filteredPermissions.filter((id) => !permissionChildrenIds.includes(id))
        const filteredSubChildren = filteredChildren.filter((id) => !permissionSubChildrenIds.includes(id))
        newPermissions.splice(0, newPermissions.length, ...filteredSubChildren)
      } else {
        newPermissions.push(permissionId)
        newPermissions.push(...permissionChildrenIds)
        newPermissions.push(...permissionSubChildrenIds)
      }

      setFields((prevState) => ({
        ...prevState,
        permission_ids: newPermissions,
      }))
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

  const handleGetRoles = () => {
    api({
      url: '/v1/role',
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

  const handleGetAllPermissions = () => {
    api({
      url: '/v1/permission',
      withAuth: true,
      params: {
        limit: 9999,
      },
    }).then(({ data: responseData }) => {
      const permissions: any[] = []

      if (responseData.data?.data?.length) {
        const idMapping = responseData.data.data.reduce((acc: any, el: any, i: any) => {
          acc[el.name] = i
          return acc
        }, {})

        responseData.data.data.forEach((el: any) => {
          if (!el.parent) {
            permissions.push(el)
            return
          }
          const parentEl: any = responseData.data?.data[idMapping[el.parent]]
          parentEl.children = [...(parentEl.children || []), el]
        })
      }

      setDataPermissions(permissions)
    })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      })
  }

  const apiSubmitCreate = () => api({
    url: '/v1/role/create',
    withAuth: true,
    method: 'POST',
    data: {
      name: fields.name,
      level: fields.level,
      permission_ids: fields.permission_ids,
    },
  })

  const apiSubmitUpdate = () => api({
    url: `/v1/role/${fields.id}`,
    withAuth: true,
    method: 'PUT',
    data: {
      name: fields.name,
      level: fields.level,
      permission_ids: fields.permission_ids,
    },
  })

  const apiSubmitDelete = () => api({
    url: `/v1/role/${fields.id}`,
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
      handleGetRoles()
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

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    name: column.name,
    level: LEVELS.find((level) => level.level === column.level)?.label,
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
    handleGetRoles()
  }, [debounceSearch, page])

  useEffect(() => {
    handleGetAllPermissions()
  }, [])

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
            tableData={tableDatas}
            total={data.total}
            page={data.page}
            limit={PAGE_SIZE}
            onChangePage={setPage}
            isLoading={isLoadingData}
          />
        </div>
      </div>

      <Modal open={modalForm.open} title={modalForm.title} size="lg">
        <form autoComplete="off" className="flex flex-col gap-4 p-6" onSubmit={() => handleClickConfirm(fields.id ? 'update' : 'create')}>
          <Input
            placeholder="Nama Role"
            label="Nama Role"
            name="name"
            value={fields.name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />
          <Select
            placeholder="Level"
            label="Level"
            name="level"
            value={fields.level}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
            options={[{
              label: 'Pilih Level',
              value: '',
              disabled: true,
            },
            ...LEVELS.map((level) => ({
              label: level.label,
              value: level.level,
            })),
            ]}
          />
          <div>
            <p className="text-sm text-slate-600 font-medium">Pilih Permission</p>
            <div className="grid grid-cols-1 mt-2 md:grid-cols-2 gap-4">
              {dataPermissions.map((permission) => (
                <div key={permission.id} className="bg-slate-100 rounded-lg p-4">
                  <Toggle
                    label={permission.description}
                    checked={fields.permission_ids.includes(permission.id)}
                    onChange={() => handleSelectPermission(permission)}
                  />

                  <div className="pl-4 flex flex-col gap-2">
                    {permission.children && permission.children.map((child: any) => (
                      <div key={child.id}>
                        <Toggle
                          label={child.description}
                          checked={fields.permission_ids.includes(child.id)}
                          onChange={() => handleSelectPermission(child)}
                        />
                        {child.children && (
                          <div className="pl-4 flex flex-col gap-2">
                            {child.children && child.children.map((subChild: any) => (
                              <Toggle
                                key={subChild.id}
                                label={subChild.description}
                                checked={fields.permission_ids.includes(subChild.id)}
                                onChange={() => handleSelectPermission(subChild)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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

export default PageRole
