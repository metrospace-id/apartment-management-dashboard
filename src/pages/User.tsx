import { useState, useMemo, useEffect } from 'react'

import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Table from 'components/Table/Table'
import Badge from 'components/Badge'
import Button from 'components/Button'
import Modal from 'components/Modal'
import Input from 'components/Form/Input'
import { Edit as IconEdit, TrashAlt as IconTrash, FileText as IconFile } from 'components/Icons'
import type { TableHeaderProps } from 'components/Table/Table'
import useDebounce from 'hooks/useDebounce'
import Toggle from 'components/Form/Toggle'
import LoadingOverlay from 'components/Loading/LoadingOverlay'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Name',
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
  },
]

const TABLE_DATA = Array.from(Array(100).keys()).map((key) => ({
  name: `Lorem Ipsum ${key + 1}`,
  email: `lorem_ipsum${key + 1}@email.com`,
  roles: [1, 2],
}))

const ROLES = [
  {
    label: 'Admin',
    value: 1,
  },
  {
    label: 'Pegawai',
    value: 2,
  },
  {
    label: 'TRO',
    value: 3,
  }]

const PAGE_SIZE = 25

function User() {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [page, setPage] = useState(0)
  const [fields, setFields] = useState({
    email: '',
    roles: [0],
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [search, setSearch] = useState('')
  const [modalForm, setModalForm] = useState({
    title: '',
    open: false,
    readOnly: false,
  })

  const debounceSearch = useDebounce(search, 500)

  const paginateTableData = useMemo(
    () => data.slice(page * PAGE_SIZE, (page * PAGE_SIZE) + PAGE_SIZE),
    [page, data],
  )

  const handleModalFormClose = () => {
    setModalForm({
      title: '',
      open: false,
      readOnly: false,
    })
    setFields({
      email: '',
      roles: [0],
    })
  }

  const handleModalCreateOpen = () => {
    setModalForm({
      title: 'Tambah User Baru',
      open: true,
      readOnly: false,
    })
  }

  const handleModalDetailOpen = (userData: any) => {
    setModalForm({
      title: 'Detail User',
      open: true,
      readOnly: true,
    })
    setFields({
      email: userData.email,
      roles: userData.roles,
    })
  }

  const handleModalEditOpen = (userData: any) => {
    setModalForm({
      title: 'Edit User',
      open: true,
      readOnly: false,
    })
    setFields({
      email: userData.email,
      roles: userData.roles,
    })
  }

  const handleSelectRoles = (roleId: number) => {
    if (!modalForm.readOnly) {
      if (fields.roles.includes(roleId)) {
        const newRoles = [...fields.roles].filter((role) => role !== roleId)
        setFields((prevState) => ({
          ...prevState,
          roles: newRoles,
        }))
      } else {
        setFields((prevState) => ({
          ...prevState,
          roles: [...prevState.roles, roleId],
        }))
      }
    }
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

  const handleClickSubmit = () => {
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      handleModalFormClose()
    }, 500)
  }

  const tableDatas = TABLE_DATA.map((column) => ({
    name: column.name,
    email: column.email,
    role: (
      <div className="">
        {column.roles.map((role) => (
          <Badge className="mx-1" key={role}>{`Role ${role}`}</Badge>
        ))}
      </div>
    ),
    action: (
      <div className="flex items-center gap-1">
        <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
          <IconFile className="w-4 h-4" />
        </Button>
        <Button variant="primary" size="sm" icon onClick={() => handleModalEditOpen(column)}>
          <IconEdit className="w-4 h-4" />
        </Button>
        <Button variant="danger" size="sm" icon>
          <IconTrash className="w-4 h-4" />
        </Button>
      </div>
    ),
  }))

  useEffect(() => {
    if (debounceSearch) {
      setIsLoadingData(true)
      setTimeout(() => {
        setIsLoadingData(false)
        const newData = tableDatas.filter(
          (tableData) => tableData.email.toLowerCase().includes(debounceSearch.toLowerCase())
          || tableData.name.toLowerCase().includes(debounceSearch.toLowerCase()),
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
      <Breadcrumb title="User" />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 items-center">
            <Input placeholder="Cari nama, email" onChange={(e) => setSearch(e.target.value)} value={search} />
            <Button className="ml-auto" onClick={handleModalCreateOpen}>Tambah</Button>
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
        <form autoComplete="off" className="flex flex-col gap-4 p-6">
          <Input
            placeholder="email@domain.com"
            label="Email"
            name="email"
            value={fields.email}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
          />
          <div>
            <p className="text-sm text-slate-600 font-medium">Pilih Role</p>
            <div className="grid grid-cols-2 mt-2 sm:grid-cols-4 gap-4">
              {ROLES.map((role) => (
                <Toggle
                  key={role.value}
                  label={role.label}
                  checked={fields.roles.includes(role.value)}
                  onChange={() => handleSelectRoles(role.value)}
                />
              ))}
            </div>
          </div>
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">Tutup</Button>
          {!modalForm.readOnly && (
            <Button onClick={handleClickSubmit}>Kirim</Button>
          )}
        </div>
      </Modal>

      {isLoadingSubmit && (
        <LoadingOverlay />
      )}

    </Layout>
  )
}

export default User
