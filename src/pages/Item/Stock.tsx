import { useEffect, useState } from 'react'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Autocomplete from 'components/Form/Autocomplete'
import Input from 'components/Form/Input'
import {
  Edit as IconEdit,
  FileText as IconFile,
  TrashAlt as IconTrash
} from 'components/Icons'
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

const PAGE_NAME = 'Stok Barang'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Nama',
    key: 'name'
  },
  {
    label: 'Kategori Barang',
    key: 'item_category_name'
  },
  {
    label: 'Jumlah',
    key: 'quantity'
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true
  }
]

interface FieldProps {
  id: number
  name: string
  item_category_id: number | null
  quantity: number
}

const PageItemStock = () => {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0
  })
  const [dataCategories, setDataCategories] = useState<
    { id: number; name: string }[]
  >([])
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState<FieldProps>({
    id: 0,
    name: '',
    item_category_id: null,
    quantity: 0
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: '',
    variant: 'default'
  })
  const [search, setSearch] = useState('')
  const [modalForm, setModalForm] = useState({
    title: '',
    open: false,
    readOnly: false
  })
  const [modalConfirm, setModalConfirm] = useState({
    title: '',
    description: '',
    open: false
  })
  const [submitType, setSubmitType] = useState('create')

  const debounceSearch = useDebounce(search, 500, () => setPage(1))

  const handleCloseToast = () => {
    setToast({
      variant: 'default',
      open: false,
      message: ''
    })
  }

  const handleModalFormClose = () => {
    setModalForm({
      title: '',
      open: false,
      readOnly: false
    })
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false
    }))
    setFields({
      id: 0,
      name: '',
      item_category_id: 0,
      quantity: 0
    })
  }

  const handleModalConfirmClose = () => {
    if (submitType !== 'delete') {
      setModalForm((prevState) => ({
        ...prevState,
        open: true
      }))
    }
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false
    }))
  }

  const handleModalCreateOpen = () => {
    setModalForm({
      title: `Tambah ${PAGE_NAME} Baru`,
      open: true,
      readOnly: false
    })
  }

  const handleModalDetailOpen = (fieldData: any) => {
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      name: fieldData.name,
      item_category_id: fieldData.item_category_id,
      quantity: fieldData.quantity
    }))
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setModalForm({
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      name: fieldData.name,
      item_category_id: fieldData.item_category_id,
      quantity: fieldData.quantity
    }))
  }

  const handleModalDeleteOpen = (fieldData: any) => {
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE.delete.title,
      description: MODAL_CONFIRM_TYPE.delete.description,
      open: true
    })
    setSubmitType('delete')
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id
    }))
  }

  const handleChangeField = (fieldName: string, value: string | number) => {
    setFields((prevState) => ({
      ...prevState,
      [fieldName]: value
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
      open: false
    }))
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE[type].title,
      description: MODAL_CONFIRM_TYPE[type].description,
      open: true
    })
    setSubmitType(type)
  }

  const handleGetItemStocks = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/item-stock',
      withAuth: true,
      method: 'GET',
      params: {
        page,
        limit: PAGE_SIZE,
        search
      }
    })
      .then(({ data: responseData }) => {
        setData(responseData.data)
      })
      .catch((error) => {
        setToast(() => ({
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        }))
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleGetAllWorkCategories = () => {
    api({
      url: '/v1/item-category',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999
      }
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataCategories(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast(() => ({
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        }))
      })
  }

  const apiSubmitCreate = () =>
    api({
      url: '/v1/item-stock/create',
      withAuth: true,
      method: 'POST',
      data: fields
    })

  const apiSubmitUpdate = () =>
    api({
      url: `/v1/item-stock/${fields.id}`,
      withAuth: true,
      method: 'PUT',
      data: fields
    })

  const apiSubmitDelete = () =>
    api({
      url: `/v1/item-stock/${fields.id}`,
      withAuth: true,
      method: 'DELETE'
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
        handleGetItemStocks()
        handleModalFormClose()
        setToast(() => ({
          variant: 'default',
          open: true,
          message: MODAL_CONFIRM_TYPE[submitType].message
        }))
      })
      .catch((error) => {
        handleModalConfirmClose()
        setToast(() => ({
          variant: 'error',
          open: true,
          message: error.response?.data?.message
        }))
      })
      .finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    name: column.name,
    item_category_name: column.item_category_name,
    quantity: column.quantity,
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button
            variant="primary"
            size="sm"
            icon
            onClick={() => handleModalDetailOpen(column)}
          >
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        {userPermissions.includes('item-stock-edit') && (
          <Popover content="Ubah">
            <Button
              variant="primary"
              size="sm"
              icon
              onClick={() => handleModalUpdateOpen(column)}
            >
              <IconEdit className="w-4 h-4" />
            </Button>
          </Popover>
        )}
        {userPermissions.includes('item-stock-delete') && (
          <Popover content="Hapus">
            <Button
              variant="danger"
              size="sm"
              icon
              onClick={() => handleModalDeleteOpen(column)}
            >
              <IconTrash className="w-4 h-4" />
            </Button>
          </Popover>
        )}
      </div>
    )
  }))

  useEffect(() => {
    handleGetItemStocks()
  }, [debounceSearch, page])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser.permissions) {
        setUserPermissions(localStorageUser.permissions)
      }
    }, 500)

    handleGetAllWorkCategories()
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input
                placeholder="Cari nama"
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
            </div>
            <Button className="sm:ml-auto" onClick={handleModalCreateOpen}>
              Tambah
            </Button>
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
        <form
          autoComplete="off"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6"
          onSubmit={() => handleClickConfirm(fields.id ? 'update' : 'create')}
        >
          <Input
            placeholder="Nama Barang"
            label="Nama Barang"
            name="name"
            value={fields.name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Jenis Barang"
            label="Jenis Barang"
            name="item_category_id"
            items={dataCategories.map((itemData) => ({
              label: itemData.name,
              value: itemData.id
            }))}
            value={{
              label:
                dataCategories.find(
                  (itemData) => itemData.id === fields.item_category_id
                )?.name || '',
              value:
                dataCategories.find(
                  (itemData) => itemData.id === fields.item_category_id
                )?.id || ''
            }}
            onChange={(value) =>
              handleChangeField('item_category_id', value.value)
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Jumlah"
            label="Jumlah"
            name="quantity"
            value={(+fields.quantity).toLocaleString()}
            onChange={(e) =>
              handleChangeNumericField(
                e.target.name,
                e.target.value.replace(/\W+/g, '')
              )
            }
            readOnly={modalForm.readOnly}
            fullWidth
          />
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">
            Tutup
          </Button>
          {!modalForm.readOnly && (
            <Button
              onClick={() =>
                handleClickConfirm(fields.id ? 'update' : 'create')
              }
            >
              Kirim
            </Button>
          )}
        </div>
      </Modal>

      <Modal open={modalConfirm.open} title={modalConfirm.title} size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">
            {modalConfirm.description}
          </p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalConfirmClose} variant="default">
            Kembali
          </Button>
          <Button onClick={handleClickSubmit}>Kirim</Button>
        </div>
      </Modal>

      {isLoadingSubmit && <LoadingOverlay />}

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={handleCloseToast}
      />
    </Layout>
  )
}

export default PageItemStock
